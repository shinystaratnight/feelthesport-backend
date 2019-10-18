  -- TABLES

CREATE TABLE main (
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  social_media TEXT [],
  terms_and_conditions TEXT [],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cities (
  city TEXT NOT NULL UNIQUE PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE areas (
  area TEXT NOT NULL,
  city TEXT NOT NULL REFERENCES cities(city) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (city, area)
);

CREATE TABLE sport_categories (
  category TEXT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sports (
  sport TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL REFERENCES sport_categories(category) ON UPDATE CASCADE ON DELETE CASCADE,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (sport, category)
);

CREATE TABLE court_types (
  type TEXT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facilities (
  facility TEXT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE banners (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  image TEXT NOT NULL,
  city TEXT REFERENCES cities(city) ON UPDATE CASCADE ON DELETE CASCADE,
  sport TEXT REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  hidden BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quotes (
  quote TEXT NOT NULL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE form_fields (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  values TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(
    type = 'alpha'
    OR type = 'numeric'
    OR type = 'alphanumeric'
    OR type = 'radio'
    OR type = 'checkbox'
    OR type = 'date'
    OR type = 'email'
    OR type = 'phone'
    OR type = 'uri'
  ),
  CHECK(
    ((type = 'radio' OR type = 'checkbox') AND values IS NOT NULL)
    OR values IS NULL
  )
);

CREATE TABLE registration_forms (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registration_form_fields (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form INT NOT NULL REFERENCES registration_forms(id),
  field INT NOT NULL REFERENCES form_fields(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registration_form_submissions (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  form INT NOT NULL REFERENCES registration_forms(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registration_form_submission_fields (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  submission INT NOT NULL REFERENCES registration_form_submissions(id),
  field INT NOT NULL REFERENCES registration_form_fields(id),
  input_text TEXT,
  input_number SMALLINT,
  input_date TEXT,
  input_array TEXT[],
  type TEXT NOT NULL,
  required BOOLEAN NOT NULL,
  values TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(
    CASE WHEN (input_text IS NOT NULL)
    THEN (input_number IS NULL AND input_date IS NULL AND input_array IS NULL)
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (input_number IS NOT NULL)
    THEN (input_text IS NULL AND input_date IS NULL AND input_array IS NULL)
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (input_date IS NOT NULL)
    THEN (input_text IS NULL AND input_number IS NULL AND input_array IS NULL)
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (input_array IS NOT NULL)
    THEN (input_text IS NULL AND input_number IS NULL AND input_date IS NULL)
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (type = 'numeric' AND required = TRUE)
    THEN input_number IS NOT NULL
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (type = 'checkbox' AND required = TRUE)
    THEN input_array IS NOT NULL
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (type = 'date' AND required = TRUE)
    THEN input_date IS NOT NULL
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (type != 'checkbox' AND type != 'numeric' AND type != 'date' AND required = TRUE)
    THEN input_text IS NOT NULL
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (type = 'radio' AND input_text IS NOT NULL)
    THEN values @> ARRAY[input_text]
    ELSE TRUE
    END
  ),
  CHECK(
    CASE WHEN (type = 'checkbox' AND input_array IS NOT NULL)
    THEN values @> input_array
    ELSE TRUE
    END
  )
);

CREATE TABLE arenas (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  trainer TEXT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  working_days TEXT [] NOT NULL,
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  image TEXT,
  gallery TEXT [],
  partners TEXT [],
  terms_and_conditions TEXT [],
  phone TEXT,
  email TEXT,
  social_media TEXT [],
  social_media_shares INT,
  show_rating BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (city, area) REFERENCES areas(city, area) ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK(
    working_days <@ ARRAY['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    AND array_length(working_days, 1) = array_length(anyarray_uniq(working_days), 1)
  )
);

CREATE TABLE organizers (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  organizer TEXT UNIQUE,
  arena INT UNIQUE REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(NUM_NONNULLS(organizer, arena) = 1)
);

CREATE TABLE complexes (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arena INT UNIQUE REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  name TEXT UNIQUE,
  city TEXT,
  area TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  social_media TEXT [],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY (city, area) REFERENCES areas(city, area) ON UPDATE CASCADE ON DELETE CASCADE,
  CHECK(
    (
      arena IS NOT NULL
      AND name IS NULL
      AND city IS NULL
      AND address IS NULL
     )
    OR
    (
      arena IS NULL
      AND name IS NOT NULL
      AND city IS NOT NULL
      AND address IS NOT NULL
    )
  ),
  CHECK(
    (
      arena IS NOT NULL
      AND phone IS NULL
      AND email IS NULL
      AND social_media IS NULL
     )
    OR TRUE
  )
);

CREATE TABLE courts (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type TEXT NOT NULL REFERENCES court_types(type) ON UPDATE CASCADE ON DELETE CASCADE,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  organizer INT NOT NULL REFERENCES organizers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  complex INT NOT NULL REFERENCES complexes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sport TEXT NOT NULL REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  form INT REFERENCES registration_forms(id) ON UPDATE CASCADE ON DELETE CASCADE,
  date_range DATERANGE NOT NULL,
  time_range INT4RANGE NOT NULL,
  age_range INT4RANGE NOT NULL DEFAULT INT4RANGE(0, 100),
  gender TEXT NOT NULL,
  max_participants SMALLINT NOT NULL,
  gallery TEXT [],
  terms_and_conditions TEXT [],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(gender = 'Male' OR gender = 'Female' OR gender = 'Other'),
  CHECK(max_participants >= 1)
);

CREATE TABLE event_categories (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event INT NOT NULL REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE arena_facilities (
  facility TEXT NOT NULL REFERENCES facilities(facility) ON UPDATE CASCADE ON DELETE CASCADE,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  PRIMARY KEY (arena, facility)
);

CREATE TABLE board_members (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  avatar TEXT,
  social_media TEXT [],
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coaches (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  avatar TEXT,
  social_media TEXT [],
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE players (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  avatar TEXT,
  social_media TEXT [],
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE achievements (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE news (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image TEXT,
  arena INT NOT NULL REFERENCES arenas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT  NULL,
  email TEXT  NULL UNIQUE,
  email_verify_code TEXT NULL,
  email_verify BOOLEAN NOT NULL DEFAULT FALSE,
  phone TEXT NULL UNIQUE,
  phone_verify_code TEXT NULL,
  phone_verify BOOLEAN NOT NULL DEFAULT FALSE,
  facebook_id TEXT  NULL UNIQUE,
  google_id TEXT  NULL UNIQUE,
  gender TEXT NOT NULL,
  date_of_birth DATE  NULL,
  date_of_registration TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referrer_code TEXT,
  points SMALLINT NOT NULL DEFAULT 0,
  selected_city TEXT REFERENCES cities(city) ON UPDATE CASCADE ON DELETE CASCADE,
  selected_sport TEXT REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(gender = 'male' OR gender = 'female' OR gender = 'other')
);

CREATE TABLE reviews (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  reviewer INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  rating SMALLINT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE replies (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  review INT NOT NULL REFERENCES reviews(id) ON UPDATE CASCADE ON DELETE CASCADE,
  replier INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE offers (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  city TEXT REFERENCES cities(city) ON UPDATE CASCADE ON DELETE CASCADE,
  sport TEXT REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  arena INT REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  event INT REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  discount_type TEXT NOT NULL,
  discount SMALLINT NOT NULL,
  coupon_code TEXT NOT NULL UNIQUE,
  date_range DATERANGE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(discount_type = 'percent' OR discount_type = 'amount'),
  CHECK(discount > 0),
  CHECK(NUM_NONNULLS(city, sport, arena, event) <= 1)
);

CREATE TABLE arena_bookaslots (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  description TEXT NOT NULL,
  sport TEXT NOT NULL REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  date_range DATERANGE NOT NULL DEFAULT DATERANGE(NOW()::DATE, 'infinity'),
  price SMALLINT NOT NULL,
  charge_per_player BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING gist (arena with =, sport with =, date_range WITH &&)
);

CREATE TABLE arena_memberships (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  description TEXT NOT NULL,
  sport TEXT NOT NULL REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  date_range DATERANGE NOT NULL DEFAULT DATERANGE(NOW()::DATE, 'infinity'),
  form INT REFERENCES registration_forms(id) ON UPDATE CASCADE ON DELETE CASCADE,
  max_participants SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(max_participants >= 1)
);

CREATE TABLE arena_membership_periods (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  membership INT NOT NULL REFERENCES arena_memberships(id) ON UPDATE CASCADE ON DELETE CASCADE,
  period SMALLINT NOT NULL,
  price SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE arena_coachings (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  arena INT NOT NULL REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  description TEXT NOT NULL,
  sport TEXT NOT NULL REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  date_range DATERANGE NOT NULL DEFAULT DATERANGE(NOW()::DATE, 'infinity'),
  form INT REFERENCES registration_forms(id) ON UPDATE CASCADE ON DELETE CASCADE,
  max_participants SMALLINT NOT NULL CHECK(max_participants >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE arena_coaching_periods (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  coaching INT NOT NULL REFERENCES arena_coachings(id) ON UPDATE CASCADE ON DELETE CASCADE,
  period SMALLINT NOT NULL,
  price SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE arena_time_slots (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bookaslot INT REFERENCES arena_bookaslots(id) ON UPDATE CASCADE ON DELETE CASCADE,
  membership INT REFERENCES arena_memberships(id) ON UPDATE CASCADE ON DELETE CASCADE,
  coaching INT REFERENCES arena_coachings(id) ON UPDATE CASCADE ON DELETE CASCADE,
  court INT NOT NULL REFERENCES courts(id) ON UPDATE CASCADE ON DELETE CASCADE,
  date_range DATERANGE NOT NULL,
  slot INT4RANGE NOT NULL,
  min_players SMALLINT NOT NULL DEFAULT 1,
  max_players SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(min_players >= 1 AND max_players >= min_players),
  CHECK(NUM_NONNULLS(bookaslot, membership, coaching) = 1),
  CHECK(LOWER(slot) >= 0 AND LOWER(slot) < 48),
  CHECK(UPPER(slot) - LOWER(slot) >= 1 AND UPPER(slot) - LOWER(slot) <= 48),
  EXCLUDE USING gist (court with =, date_range WITH &&, slot WITH &&)
);

CREATE TABLE carts (
  user_id INT NOT NULL PRIMARY KEY REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  order_id TEXT,
  offer_used INT REFERENCES offers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  points_used SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_user_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart INT NOT NULL REFERENCES carts(user_id) ON UPDATE CASCADE ON DELETE CASCADE,
  bookaslot_slot INT REFERENCES arena_time_slots(id) ON UPDATE CASCADE ON DELETE CASCADE,
  bookaslot_date DATE,
  bookaslot_players SMALLINT,
  membership_period INT REFERENCES arena_membership_periods(id) ON UPDATE CASCADE ON DELETE CASCADE,
  coaching_period INT REFERENCES arena_coaching_periods(id) ON UPDATE CASCADE ON DELETE CASCADE,
  event_category INT REFERENCES event_categories(id) ON UPDATE CASCADE ON DELETE CASCADE,
  form_submission INT REFERENCES registration_form_submissions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  city TEXT REFERENCES cities(city) ON UPDATE CASCADE ON DELETE CASCADE,
  sport TEXT REFERENCES sports(sport) ON UPDATE CASCADE ON DELETE CASCADE,
  arena SMALLINT REFERENCES arenas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  event SMALLINT REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart, bookaslot_slot, bookaslot_date),
  UNIQUE(cart, membership_period, form_submission),
  UNIQUE(cart, coaching_period, form_submission),
  UNIQUE(cart, event_category, form_submission),
  CHECK(NUM_NONNULLS(bookaslot_slot, membership_period, coaching_period, event_category) = 1),
  CHECK (
    (bookaslot_slot, bookaslot_date, bookaslot_players) IS NOT NULL
    OR (bookaslot_date, bookaslot_players) IS NULL
  ),
  CHECK(
    NUM_NONNULLS(membership_period, coaching_period, event_category, form_submission) = 2
    OR form_submission IS NULL
  ),
  EXCLUDE USING gist (bookaslot_slot WITH =, bookaslot_date WITH =, cart WITH <>)
);

CREATE TABLE transactions (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  points_used SMALLINT NOT NULL,
  offer_used INT REFERENCES offers(id) ON UPDATE CASCADE ON DELETE CASCADE,
  totalDiscount INT NOT NULL,
  discounted_price SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE transaction_items (
  id INT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transaction INT NOT NULL REFERENCES transactions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  price SMALLINT NOT NULL,
  bookaslot_slot INT REFERENCES arena_time_slots(id) ON UPDATE CASCADE ON DELETE CASCADE,
  bookaslot_date DATE,
  bookaslot_players SMALLINT,
  membership_period INT REFERENCES arena_membership_periods(id) ON UPDATE CASCADE ON DELETE CASCADE,
  coaching_period INT REFERENCES arena_coaching_periods(id) ON UPDATE CASCADE ON DELETE CASCADE,
  event_category INT REFERENCES event_categories(id) ON UPDATE CASCADE ON DELETE CASCADE,
  form_submission INT REFERENCES registration_form_submissions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(transaction, bookaslot_slot, bookaslot_date),
  UNIQUE(transaction, membership_period, form_submission),
  UNIQUE(transaction, coaching_period, form_submission),
  UNIQUE(transaction, event_category, form_submission),
  CHECK(NUM_NONNULLS(bookaslot_slot, membership_period, coaching_period, event_category) = 1),
  CHECK (
    (bookaslot_slot, bookaslot_date, bookaslot_players) IS NOT NULL
    OR (bookaslot_date, bookaslot_players) IS NULL
  ),
  CHECK(
    NUM_NONNULLS(membership_period, coaching_period, event_category, form_submission) = 2
    OR form_submission IS NULL
  ),
    EXCLUDE USING gist (bookaslot_slot WITH =, bookaslot_date WITH =, transaction WITH <>)
);



