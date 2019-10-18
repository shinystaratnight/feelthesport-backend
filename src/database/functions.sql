
CREATE OR REPLACE FUNCTION copy_date_and_unnullify_players() RETURNS TRIGGER AS $BODY$ 
BEGIN
IF (NEW.bookaslot IS NOT NULL) THEN
  NEW.date_range := (
    SELECT
      date_range
    FROM
      arena_bookaslots
    WHERE
      id = NEW.bookaslot
  );
ELSIF (NEW.membership IS NOT NULL) THEN
  NEW.date_range := (
    SELECT
      date_range
    FROM
      arena_memberships
    WHERE
      id = NEW.membership
  );
ELSIF (NEW.coaching IS NOT NULL) THEN
  NEW.date_range := (
    SELECT
      date_range
    FROM
      arena_coachings
    WHERE
      id = NEW.coaching
  );
END IF;

NEW.min_players := COALESCE(NEW.min_players, 1);
NEW.max_players := COALESCE(NEW.max_players, 1);
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE OR REPLACE FUNCTION insert_arena_into_organizers_and_complexes() RETURNS TRIGGER AS $BODY$ 
BEGIN 
INSERT INTO organizers (arena) VALUES (NEW.id);
INSERT INTO complexes (arena) VALUES (NEW.id);
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE
OR REPLACE FUNCTION check_if_can_add_event_category() RETURNS TRIGGER AS $BODY$
BEGIN 
IF (
  (
    SELECT
      form
    FROM
      events
    WHERE
      id = NEW.event
  ) IS NULL
) THEN RAISE EXCEPTION 'cant add an event category to an event that does not have a form';
END IF;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE
OR REPLACE FUNCTION check_if_can_add_court_to_arena_time_slots() RETURNS TRIGGER AS $BODY$
BEGIN 
IF (NEW.bookaslot IS NOT NULL AND
    NOT EXISTS
    (
      SELECT
        1
      FROM
        arena_bookaslots
        JOIN courts ON courts.arena = arena_bookaslots.arena
      WHERE
        courts.id = NEW.court AND
        arena_bookaslots.id = NEW.bookaslot
    )
) THEN RAISE EXCEPTION 'court belongs to another arena';
ELSIF (NEW.membership IS NOT NULL AND
    NOT EXISTS
    (
      SELECT
        1
      FROM
        arena_memberships
        JOIN courts ON courts.arena = arena_memberships.arena
      WHERE
        courts.id = NEW.court AND
        arena_memberships.id = NEW.membership
    )
) THEN RAISE EXCEPTION 'court belongs to another arena';
ELSIF (NEW.coaching IS NOT NULL AND
    NOT EXISTS
    (
      SELECT
        1
      FROM
        arena_coachings
        JOIN courts ON courts.arena = arena_coachings.arena
      WHERE
        courts.id = NEW.court AND
        arena_coachings.id = NEW.coaching
    )
) THEN RAISE EXCEPTION 'court belongs to another arena';
END IF;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE
OR REPLACE FUNCTION check_if_can_add_membership_or_coaching() RETURNS TRIGGER AS $BODY$
BEGIN
IF (NEW.membership IS NOT NULL AND
  NOT EXISTS (
    SELECT
      1
    FROM
      arena_membership_periods
    WHERE
      membership = NEW.membership
  )
) THEN RAISE EXCEPTION 'cant add membership or coaching time slots for memberships or coachings without periods';
ELSIF (NEW.coaching IS NOT NULL AND
  NOT EXISTS (
    SELECT
      1
    FROM
      arena_coaching_periods
    WHERE
      coaching = NEW.coaching
  )
) THEN RAISE EXCEPTION 'cant add membership or coaching time slots for memberships or coachings without periods';
END IF;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE OR REPLACE FUNCTION copy_field_info() RETURNS TRIGGER AS $BODY$
DECLARE
  type_copy TEXT;
  required_copy TEXT;
  values_copy TEXT;
BEGIN
  SELECT
    type, required, values
    INTO type_copy, required_copy, values_copy
  FROM
    form_fields
  WHERE
    id = NEW.field;

NEW.type := type_copy;
NEW.required := required_copy;
NEW.values := values_copy;

RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
---
---
---
CREATE
OR REPLACE FUNCTION add_form_submission(membership INT, coaching INT, event INT, form_submission JSON) 
RETURNS INT AS $BODY$ 
DECLARE
  form_id INT;
  form_submission_id INT;
BEGIN
  IF((CASE WHEN membership IS NULL THEN 0 ELSE 1 END) + 
      (CASE WHEN coaching IS NULL THEN 0 ELSE 1 END) + 
      (CASE WHEN event IS NULL THEN 0 ELSE 1 END) != 1
    ) THEN RAISE EXCEPTION 'membership and coaching and event cant be passed together';
  END IF;
  
  IF membership IS NOT NULL THEN
    SELECT
      form INTO form_id
    FROM
      arena_memberships
    WHERE
      id = membership;
  ELSIF coaching IS NOT NULL THEN
    SELECT
      form INTO form_id
    FROM
      arena_coachings
    WHERE
      id = coaching;
  ELSIF event IS NOT NULL THEN
    SELECT
      form INTO form_id
    FROM
      events
    WHERE
      id = event;
  END IF;

  INSERT INTO
    registration_form_submissions (form)
  VALUES
    (form_id) RETURNING id INTO form_submission_id;

  INSERT INTO
    registration_form_submission_fields (
      submission,
      field,
      input_number,
      input_array,
      input_date,
      input_text
    )
  SELECT
    form_submission_id,
    (sub ->> 'fieldId') :: INT,
    (
      CASE WHEN f.type = 'numeric' THEN (sub ->> 'input') :: SMALLINT ELSE NULL END
    ),
    (
      CASE WHEN f.type = 'checkbox' THEN ARRAY(
        SELECT
          JSON_ARRAY_ELEMENTS_TEXT(sub -> 'input')
      ) ELSE NULL END
    ),
    (
      CASE WHEN f.type = 'date' THEN (sub ->> 'input') :: DATE ELSE NULL END
    ),
    (
      CASE WHEN ARRAY[f.type] <@ ARRAY[
        'alpha',
        'alphanumeric',
        'radio',
        'email',
        'phone',
        'uri'
      ] THEN sub ->> 'input' ELSE NULL END
    )
  FROM
    JSON_ARRAY_ELEMENTS(form_submission) as sub
    JOIN form_fields as f ON (sub ->> 'fieldId') :: INT = f.id;
  IF (
      (
        SELECT
          COUNT(*)
        FROM
          registration_form_fields
        WHERE
          form = form_id
      ) != (
        SELECT
          COUNT(*)
        FROM
          registration_form_submission_fields
        WHERE
          submission = form_submission_id
      )
    ) THEN RAISE EXCEPTION 'submission missing fields';
END IF;

RETURN form_submission_id;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
DROP FUNCTION IF EXISTS anyarray_uniq(anyarray);
CREATE OR REPLACE FUNCTION anyarray_uniq(with_array anyarray)
	RETURNS anyarray AS
$BODY$
	DECLARE
		-- The variable used to track iteration over "with_array".
		loop_offset integer;

		-- The array to be returned by this function.
		return_array with_array%TYPE := '{}';
	BEGIN
		IF with_array IS NULL THEN
			return NULL;
		END IF;
		
		IF with_array = '{}' THEN
		    return return_array;
		END IF;

		-- Iterate over each element in "concat_array".
		FOR loop_offset IN ARRAY_LOWER(with_array, 1)..ARRAY_UPPER(with_array, 1) LOOP
			IF with_array[loop_offset] IS NULL THEN
				IF NOT EXISTS(
					SELECT 1 
					FROM UNNEST(return_array) AS s(a)
					WHERE a IS NULL
				) THEN
					return_array = ARRAY_APPEND(return_array, with_array[loop_offset]);
				END IF;
			-- When an array contains a NULL value, ANY() returns NULL instead of FALSE...
			ELSEIF NOT(with_array[loop_offset] = ANY(return_array)) OR NOT(NULL IS DISTINCT FROM (with_array[loop_offset] = ANY(return_array))) THEN
				return_array = ARRAY_APPEND(return_array, with_array[loop_offset]);
			END IF;
		END LOOP;

	RETURN return_array;
 END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE OR REPLACE FUNCTION create_cart() RETURNS TRIGGER AS $BODY$ 
BEGIN 
INSERT INTO carts (user_id) VALUES (NEW.id);
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE OR REPLACE FUNCTION cart_item_init() RETURNS TRIGGER AS $BODY$
DECLARE
  offer_city TEXT;
  offer_sport TEXT;
  offer_arena SMALLINT;
  offer_event SMALLINT;
  offer_bookaslot SMALLINT;
  offer_complex SMALLINT;
  time_slot INT4RANGE;
BEGIN 
IF (NEW.bookaslot_slot IS NOT NULL) THEN
  SELECT
    arena_time_slots.bookaslot INTO offer_bookaslot
  FROM
    arena_time_slots
  WHERE
    arena_time_slots.id = NEW.bookaslot_slot;

  SELECT
    arena_bookaslots.arena,
    arena_bookaslots.sport
    INTO 
    offer_arena, 
    offer_sport
  FROM
    arena_bookaslots
  WHERE
    arena_bookaslots.id = offer_bookaslot;

  SELECT
    arenas.city INTO offer_city
  FROM
    arenas
  WHERE
    arenas.id = offer_arena;

  NEW.city := offer_city;
  NEW.sport := offer_sport;
  NEW.arena := offer_arena;

  SELECT
    arena_time_slots.slot INTO time_slot
  FROM
    arena_time_slots
  WHERE
    arena_time_slots.id = NEW.bookaslot_slot;
  
  IF (
      (NOW() + TIME '00:30') > 
      (NEW.bookaslot_date + (LOWER(time_slot) * TIME '00:30')) 
      ) THEN RAISE EXCEPTION 'booked slot not within allowable booking time range';
  END IF;

ELSIF (NEW.event_category IS NOT NULL) THEN
  SELECT
    event_categories.event INTO offer_event
  FROM
    event_categories
  WHERE
    event_categories.id = NEW.event_category;

  SELECT
    events.complex,
    events.sport
    INTO 
    offer_complex,
    offer_sport
  FROM
    events
  WHERE
    events.id = offer_event;

  SELECT
    complexes.arena,
    complexes.city
    INTO 
    offer_arena,
    offer_city
  FROM
    complexes
  WHERE
    complexes.id = offer_complex;

    IF (offer_arena IS NOT NULL) THEN  
    SELECT
      arenas.city INTO offer_city
    FROM
      arenas
    WHERE
      arenas.id = offer_arena;
    END IF;

  NEW.city := offer_city;
  NEW.sport := offer_sport;
  NEW.arena := offer_arena;
  NEW.event := offer_event;

END IF;

RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE
OR REPLACE FUNCTION check_if_can_update_cart_points() RETURNS TRIGGER AS $BODY$
DECLARE
  user_points SMALLINT;
BEGIN 

SELECT
  points INTO user_points
FROM
  users
WHERE
  id = NEW.user_id;

IF (NEW.points_used > user_points) 
  THEN RAISE EXCEPTION 'user doesnt have enough points';
END if;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--
CREATE OR REPLACE FUNCTION check_if_user_can_review() RETURNS TRIGGER AS $BODY$ 
BEGIN 
IF (
  (
    SELECT
      COUNT(*)
    FROM
      reviews
    WHERE
      reviewer = NEW.reviewer
      AND arena = NEW.arena
  )
  >=
  (
    SELECT
      COUNT(transaction_items.id)
    FROM
      transactions
      JOIN transaction_items ON transaction_items.transaction = transactions.id
      JOIN arena_time_slots ON arena_time_slots.id = transaction_items.bookaslot_slot
      JOIN arena_bookaslots ON arena_bookaslots.id = arena_time_slots.bookaslot
    WHERE
      transactions.user_id = NEW.reviewer
      AND arena_bookaslots.arena = NEW.arena
  )
) THEN RAISE EXCEPTION 'one review per transaction for an arena';
END IF;
RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;
--
--
--