INSERT INTO
  main (phone, email, social_media, terms_and_conditions)
VALUES
  (
    '7513200000',
    'ftssupport@gmail.com',
    ARRAY ['https://facebook.com', 'https://twitter.com'],
    ARRAY ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget.',
   'Pellentesque porta porttitor porttitor. Aenean quis sem nulla. Praesent cursus sem risus, a pharetra lacus pretium iaculis. Etiam elementum rhoncus urna, id euismod nibh iaculis in.',
 'Suspendisse potenti. Maecenas venenatis felis sit amet lacinia hendrerit.',
   'Etiam tempor, est non eleifend varius, ipsum nunc cursus turpis, ut tristique risus nisl vel lectus. Praesent et sagittis leo. Integer maximus, purus id aliquet lacinia, eros urna gravida turpis, et tincidunt turpis arcu ac mauris.']
  );

INSERT INTO
  cities (city)
VALUES
  ('Mumbai'),
  ('Delhi'),
  ('Bangalore'),
  ('Hyderabad'),
  ('Ahmedabad'),
  ('Chennai'),
  ('Kolkata'),
  ('Surat'),
  ('Pune'),
  ('Jaipur');

INSERT INTO
  areas (city, area)
VALUES
  ('Mumbai', 'Block1'),
  ('Mumbai', 'Block2'),
  ('Mumbai', 'Block3'),
  ('Delhi', 'Block1');

INSERT INTO
  sport_categories (category)
VALUES
  ('Fitness'),
  ('Ball sports'),
  ('Adventure sports');

INSERT INTO
  sports (sport, category, icon)
VALUES
  (
    'Football',
    'Ball sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Badminton',
    'Ball sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Basketball',
    'Ball sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Baseball',
    'Ball sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Rugby',
    'Ball sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Volleyball',
    'Ball sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Yoga',
    'Fitness',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Zumba',
    'Fitness',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Gym',
    'Fitness',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Boxing',
    'Fitness',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Cycling',
    'Fitness',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Tennis',
    'Fitness',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Canoeing',
    'Adventure sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Climbing',
    'Adventure sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Rafting',
    'Adventure sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Hiking',
    'Adventure sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Surfing',
    'Adventure sports',
    'https://i.imgur.com/bVuwZPA.png'
  ),
  (
    'Kayaking',
    'Adventure sports',
    'https://i.imgur.com/bVuwZPA.png'
  );

INSERT INTO
  court_types (type)
VALUES
  ('Grass'),
  ('Rubber'),
  ('Stone');

INSERT INTO
  facilities (facility)
VALUES
  ('Water'),
  ('Shower'),
  ('Canteen'),
  ('Changing Room'),
  ('2 Wheeler Parking'),
  ('4 Wheeler Parking'),
  ('Locker');

INSERT INTO
  banners (image, city, sport, hidden)
VALUES
  (
    'https://i.imgur.com/zkfqyc9.jpg',
    'Delhi',
    NULL,
    false
  ),
  (
    'https://i.imgur.com/XMRtfnH.jpg',
    'Delhi',
    NULL,
    false
  ),
  (
    'https://i.imgur.com/AGPwfaJ.jpg',
    'Mumbai',
    NULL,
    false
  ),
  (
    'https://i.imgur.com/gYGI7Vl.jpg',
    'Delhi',
    'Football',
    false
  ),
  (
    'https://i.imgur.com/iAFai7p.jpg',
    'Delhi',
    NULL,
    false
  ),
   (
      'https://i.imgur.com/iAFai7p.jpg',
      'Ahmedabad',
      NULL,
      false
  ),
  (
      'https://i.imgur.com/gYGI7Vl.jpg',
      'Ahmedabad',
      NULL,
      false
  ),
       (
      'https://i.imgur.com/zkfqyc9.jpg',
      'Surat',
      NULL,
      false
  ),
  (
      'https://i.imgur.com/gYGI7Vl.jpg',
      NULL,
      NULL,
      true
  )

  ;

INSERT INTO
  quotes (quote)
VALUES
  ('abcdefghijklmnop'),
  ('1234567890zzzzzzzzz'),
  ('xxxxxxxxxxxxxxxxxxxxxxxx');

INSERT INTO
  arenas (
    name,
    description,
    city,
    area,
    address,
    phone,
    email,
    working_days,
    opening_time,
    closing_time,
    image,
    gallery,
    partners,
    social_media,
    terms_and_conditions
  )
VALUES
  (
    'Arena 1',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nulla ipsum, vestibulum sed eleifend in, auctor eu ex. Integer sit amet sollicitudin lectus, nec accumsan turpis. Nulla facilisi.',
    'Delhi',
    'Block1',
    'an address for the arena',
    '7513200001',
    'someemail@gmail.com',
    ARRAY ['sun', 'mon', 'thu', 'fri'],
    '08:00',
    '19:00',
    'https://i.imgur.com/2TX2rmL.jpg',
    ARRAY [
  'https://i.imgur.com/OdJMVrE.jpg',
  'https://i.imgur.com/arkJqKA.jpg',
  'https://i.imgur.com/9zvYLRp.jpg',
  'https://i.imgur.com/LZFSyoB.jpg',
  'https://i.imgur.com/aQrDtrr.jpg'],
    ARRAY [
  'https://i.imgur.com/OdJMVrE.jpg',
  'https://i.imgur.com/arkJqKA.jpg',
  'https://i.imgur.com/aQrDtrr.jpg'],
    ARRAY [
  'https://facebook.com',
  'https://twitter.com'],
    ARRAY ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget.',
   'Pellentesque porta porttitor porttitor. Aenean quis sem nulla. Praesent cursus sem risus, a pharetra lacus pretium iaculis. Etiam elementum rhoncus urna, id euismod nibh iaculis in.',
 'Suspendisse potenti. Maecenas venenatis felis sit amet lacinia hendrerit.',
   'Etiam tempor, est non eleifend varius, ipsum nunc cursus turpis, ut tristique risus nisl vel lectus. Praesent et sagittis leo. Integer maximus, purus id aliquet lacinia, eros urna gravida turpis, et tincidunt turpis arcu ac mauris.']
  ),
  (
    'Arena 2',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nulla ipsum, vestibulum sed eleifend in, auctor eu ex. Integer sit amet sollicitudin lectus, nec accumsan turpis. Nulla facilisi.',
    'Mumbai',
    'Block1',
    'an address for the arena',
    '7513200001',
    'someemail@gmail.com',
    ARRAY ['sun', 'mon', 'fri', 'sat'],
    '08:00',
    '19:00',
    'https://i.imgur.com/2TX2rmL.jpg',
    ARRAY [
  'https://i.imgur.com/OdJMVrE.jpg',
  'https://i.imgur.com/arkJqKA.jpg',
  'https://i.imgur.com/9zvYLRp.jpg',
  'https://i.imgur.com/LZFSyoB.jpg',
  'https://i.imgur.com/aQrDtrr.jpg'],
    ARRAY [
  'https://i.imgur.com/OdJMVrE.jpg',
  'https://i.imgur.com/arkJqKA.jpg',
  'https://i.imgur.com/aQrDtrr.jpg'],
    ARRAY [
  'https://facebook.com',
  'https://twitter.com'],
    ARRAY ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget.',
   'Pellentesque porta porttitor porttitor. Aenean quis sem nulla. Praesent cursus sem risus, a pharetra lacus pretium iaculis. Etiam elementum rhoncus urna, id euismod nibh iaculis in.',
 'Suspendisse potenti. Maecenas venenatis felis sit amet lacinia hendrerit.',
   'Etiam tempor, est non eleifend varius, ipsum nunc cursus turpis, ut tristique risus nisl vel lectus. Praesent et sagittis leo. Integer maximus, purus id aliquet lacinia, eros urna gravida turpis, et tincidunt turpis arcu ac mauris.']
  ),
  (
    'Arena 3',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nulla ipsum, vestibulum sed eleifend in, auctor eu ex. Integer sit amet sollicitudin lectus, nec accumsan turpis. Nulla facilisi.',
    'Mumbai',
    'Block2',
    'an address for the arena',
    '7513200007',
    'someemail2@gmail.com',
    ARRAY ['sun', 'mon', 'fri', 'sat'],
    '08:00',
    '19:00',
    'https://i.imgur.com/2TX2rmL.jpg',
    ARRAY [
  'https://i.imgur.com/OdJMVrE.jpg',
  'https://i.imgur.com/arkJqKA.jpg',
  'https://i.imgur.com/9zvYLRp.jpg',
  'https://i.imgur.com/LZFSyoB.jpg',
  'https://i.imgur.com/aQrDtrr.jpg'],
    ARRAY [
  'https://i.imgur.com/OdJMVrE.jpg',
  'https://i.imgur.com/arkJqKA.jpg',
  'https://i.imgur.com/aQrDtrr.jpg'],
    ARRAY [
  'https://facebook.com',
  'https://twitter.com'],
    ARRAY ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget.',
   'Pellentesque porta porttitor porttitor. Aenean quis sem nulla. Praesent cursus sem risus, a pharetra lacus pretium iaculis. Etiam elementum rhoncus urna, id euismod nibh iaculis in.',
 'Suspendisse potenti. Maecenas venenatis felis sit amet lacinia hendrerit.',
   'Etiam tempor, est non eleifend varius, ipsum nunc cursus turpis, ut tristique risus nisl vel lectus. Praesent et sagittis leo. Integer maximus, purus id aliquet lacinia, eros urna gravida turpis, et tincidunt turpis arcu ac mauris.']
  );

INSERT INTO
  arena_facilities (arena, facility)
VALUES
  (1, 'Water'),
  (1, 'Shower'),
  (1, 'Canteen'),
  (1, 'Changing Room'),
  (1, '2 Wheeler Parking');

INSERT INTO
  courts (arena, type)
VALUES
  (1, 'Grass'),
  (1, 'Stone'),
  (2, 'Rubber');

INSERT INTO
  board_members (arena, name, position, avatar, social_media)
VALUES
  (
    1,
    'boardmember1',
    'pos1',
    'https://i.imgur.com/pxOinoP.png',
    ARRAY [
  'https://facebook.com']
  ),
  (
    1,
    'boardmember2',
    'pos2',
    NULL,
    ARRAY [
  'https://facebook.com',
  'https://twitter.com']
  ),
  (
    1,
    'boardmember3',
    'pos3',
    'https://i.imgur.com/pxOinoP.png',
    NULL
  );

INSERT INTO
  coaches (arena, name, position, avatar, social_media)
VALUES
  (
    1,
    'coach1',
    'pos1',
    'https://i.imgur.com/pxOinoP.png',
    ARRAY [
  'https://facebook.com',
  'https://twitter.com']
  ),
  (
    1,
    'coach2',
    'pos2',
    NULL,
    ARRAY [
  'https://facebook.com',
  'https://twitter.com']
  ),
  (
    1,
    'coach3',
    'pos3',
    'https://i.imgur.com/pxOinoP.png',
    NULL
  );

INSERT INTO
  players (arena, name, position, avatar, social_media)
VALUES
  (
    1,
    'player1',
    'pos1',
    'https://i.imgur.com/pxOinoP.png',
    ARRAY [
  'https://twitter.com']
  ),
  (
    1,
    'player2',
    'pos2',
    NULL,
    ARRAY [
  'https://facebook.com',
  'https://twitter.com']
  ),
  (
    1,
    'player3',
    'pos3',
    'https://i.imgur.com/pxOinoP.png',
    NULL
  );

INSERT INTO
  achievements (arena, title, body, image)
VALUES
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    'https://i.imgur.com/LZFSyoB.jpg'
  ),
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    NULL
  ),
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    NULL
  ),
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    'https://i.imgur.com/LZFSyoB.jpg'
  );

INSERT INTO
  news (arena, title, body, image)
VALUES
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    'https://i.imgur.com/LZFSyoB.jpg'
  ),
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    NULL
  ),
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    'https://i.imgur.com/LZFSyoB.jpg'
  ),
  (
    1,
    'a title for achievements',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget. Pellentesque porta porttitor porttitor. Aenean quis sem nulla.',
    NULL
  );


INSERT INTO
  form_fields (
    name,
    type,
    required,
    values
  )
VALUES
  ('Name', 'alpha', TRUE, NULL),
  ('Age', 'numeric', TRUE, NULL),
  ('Code', 'alphanumeric', TRUE, NULL),
  ('Gender', 'radio', TRUE, ARRAY['Male', 'Female', 'Other']),
  ('Abilities', 'checkbox', FALSE, ARRAY['Fire', 'Water', 'Earth', 'Air']),
  ('Date of Birth', 'date', TRUE, NULL),
  ('Email', 'email', TRUE, NULL),
  ('Phone', 'phone', TRUE, NULL),
  ('Site', 'uri', TRUE, NULL);
-- INSERT INTO
--   form_fields (
--     name,
--     type,
--     required,
--     values
--   )
-- VALUES
--   ('Name', 'alpha', TRUE, NULL),
--   ('Date of Birth', 'date', TRUE, NULL),
--   (
--     'Gender',
--     'radio',
--     TRUE, 
--     ARRAY['Male', 'Female', 'Other']
--   ),
--   ('Phone', 'phone', TRUE, NULL),
--   ('Email', 'email', TRUE, NULL);

INSERT INTO
  registration_forms (name)
VALUES
  ('event form 1');

INSERT INTO
  registration_form_fields (form, field)
VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (1, 5),
  (1, 6),
  (1, 7),
  (1, 8),
  (1, 9);
-- INSERT INTO
--   registration_form_fields (form, field)
-- VALUES
--   (1, 1),
--   (1, 2),
--   (1, 3),
--   (1, 4),
--   (1, 5);

INSERT INTO
  arena_bookaslots (
    arena,
    category_name,
    description,
    sport,
    price,
    date_range
  )
VALUES
  (
    1,
    'Category1',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Football',
    200,
    DATERANGE('2019-02-02', '2019-08-08')
  ),
  (
    1,
    'Category2',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Tennis',
    400,
    DATERANGE('2019-03-01', '2019-09-09')
  ),
  (
    1,
    'Category3',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Baseball',
    600,
    DATERANGE('2019-01-01', '2019-10-10')
  ),
  (
    1,
    'Category4',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Baseball',
    600,
    DATERANGE('2018-01-01', '2018-10-10')
  ),
  (
    1,
    'Category5',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Baseball',
    600,
    DATERANGE('2020-01-01', '2021-10-10')
  ),
  (
    2,
    'Category1',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Tennis',
    600,
    DATERANGE('2017-01-01', '2021-10-10')
  );


INSERT INTO
  arena_memberships (
    arena,
    category_name,
    description,
    sport,
    date_range,
    form,
    max_participants
  )
VALUES
  (
    1,
    'Membership 1',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Football',
    DATERANGE('2018-01-01', '2021-10-10'),
    1,
    6
  ),
  (
    1,
    'Membership 2',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Football',
    DATERANGE('2018-01-01', '2020-10-10'),
    1,
    6
  );

INSERT INTO
  arena_coachings (
    arena,
    category_name,
    description,
    sport,
    date_range,
    form,
    max_participants
  )
VALUES
  (
    1,
    'Coaching 1',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Football',
    DATERANGE('2022-01-01', '2025-10-10'),
    1,
    6
  ),
  (
    1,
    'Coaching 2',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Football',
    DATERANGE('2018-01-01', '2020-10-10'),
    1,
    6
  ),
  (
    2,
    'Coaching 3',
    'bla bla bla bla bla bla bla bla bla bla bla bla bla',
    'Football',
    DATERANGE('2018-01-01', '2020-10-10'),
    1,
    6
  );

INSERT INTO
  arena_membership_periods (
    membership,
    period,
    price
  )
VALUES
  (
    1,
    365,
    4000
  ),
  (
    1,
    190,
    2000
  ),
  (
    2,
    90,
    1000
  ),
  (
    2,
    30,
    500
  );

INSERT INTO
  arena_coaching_periods (
    coaching,
    period,
    price
  )
VALUES
  (
    1,
    365,
    4000
  ),
  (
    1,
    190,
    2000
  ),
  (
    2,
    90,
    1000
  ),
  (
    2,
    30,
    500
  ),
  (
    3,
    30,
    600
  ),
  (
    3,
    30,
    100
  );


INSERT INTO
  arena_time_slots (
    bookaslot, 
    membership, 
    coaching, court, 
    slot, 
    min_players, 
    max_players
  )
VALUES
  (1, NULL, NULL, 1, INT4RANGE(16, 20), 2, 4),
  (1, NULL, NULL, 1, INT4RANGE(20, 24), 2, 4),
  (1, NULL, NULL, 1, INT4RANGE(24, 28), 2, 4),
  (2, NULL, NULL, 1, INT4RANGE(32, 36), 2, 4),
  (3, NULL, NULL, 1, INT4RANGE(44, 46), 2, 4),
  (3, NULL, NULL, 2, INT4RANGE(16, 18), 2, 4),
  (3, NULL, NULL, 2, INT4RANGE(18, 20), 2, 4),
  (4, NULL, NULL, 1, INT4RANGE(14, 22), 2, 4),
  (5, NULL, NULL, 1, INT4RANGE(14, 22), 2, 4),
  (NULL, 1, NULL, 1, INT4RANGE(36, 38), 2, 4),
  (NULL, 1, NULL, 1, INT4RANGE(38, 42), 1, 6),
  (NULL, 2, NULL, 1, INT4RANGE(42, 44), 1, 6),
  (NULL, NULL, 1, 2, INT4RANGE(40, 42), 1, 6),
  (NULL, NULL, 2, 2, INT4RANGE(42, 46), 1, 6),
  (NULL, NULL, 2, 2, INT4RANGE(20, 26), 1, 6),
  (6, NULL, NULL, 3, INT4RANGE(30, 32), 1, 6),
  (NULL, NULL, 3, 3, INT4RANGE(16, 18), 1, 6);

INSERT INTO
  users (
    name,
    password,
    email,
    phone,
    date_of_birth,
    gender,
    referral_code,
    avatar,
    points
  )
VALUES
  (
    'user1',
    '$2b$10$MYp8QcQJXmVb6rwrf1xpRu0qzYEj0F0rREWwtTTCUokzB0/Nnsvy.',
    'email1@gmail.com',
    '7513200010',
    '1990-01-01',
    'male',
    '8BI6d',
    'https://i.imgur.com/jRQOnL1.jpg',
    150
  ),
  (
    'user2',
    '$2b$10$MYp8QcQJXmVb6rwrf1xpRu0qzYEj0F0rREWwtTTCUokzB0/Nnsvy.',
    'email2@gmail.com',
    '7513200011',
    '1992-01-01',
    'female',
    '8BI6e',
    NULL,
    150
  );

INSERT INTO
  organizers (organizer, arena)
VALUES
  ('someOrganizer', NULL);

INSERT INTO
  complexes (name, city, area, address)
VALUES
  ('Stadium C3', 'Mumbai', 'Block1', 'an address');

INSERT INTO
  events (
    name,
    sport,
    organizer,
    complex,
    form,
    date_range,
    time_range,
    age_range,
    gender,
    max_participants,
    description,
    image,
    terms_and_conditions
  )
VALUES
  (
    'event1',
    'Football',
    1,
    1,
    1,
    DATERANGE('2019-05-05', '2019-07-07'),
    INT4RANGE(16, 21),
    INT4RANGE(8, 16),
    'Male',
    6,
    'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
    'https://i.imgur.com/2TX2rmL.jpg',
        ARRAY ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget.',
   'Pellentesque porta porttitor porttitor. Aenean quis sem nulla. Praesent cursus sem risus, a pharetra lacus pretium iaculis. Etiam elementum rhoncus urna, id euismod nibh iaculis in.',
 'Suspendisse potenti. Maecenas venenatis felis sit amet lacinia hendrerit.',
   'Etiam tempor, est non eleifend varius, ipsum nunc cursus turpis, ut tristique risus nisl vel lectus. Praesent et sagittis leo. Integer maximus, purus id aliquet lacinia, eros urna gravida turpis, et tincidunt turpis arcu ac mauris.']
  ),
  (
    'event2',
    'Basketball',
    3,
    3,
    1,
    DATERANGE('2019-06-06', '2019-08-08'),
    INT4RANGE(22, 24),
    INT4RANGE(5, 15),
    'Female',
    6,
    'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour. There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour.',
    'https://i.imgur.com/2TX2rmL.jpg',
        ARRAY ['Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sollicitudin varius quam quis tincidunt. Nullam suscipit dignissim orci. Integer nibh nibh, convallis sit amet tincidunt ac, feugiat in tortor. Proin nec ultricies nibh. Sed imperdiet vestibulum consequat. Nullam volutpat velit dui, eget feugiat purus consequat eget.',
   'Pellentesque porta porttitor porttitor. Aenean quis sem nulla. Praesent cursus sem risus, a pharetra lacus pretium iaculis. Etiam elementum rhoncus urna, id euismod nibh iaculis in.',
 'Suspendisse potenti. Maecenas venenatis felis sit amet lacinia hendrerit.',
   'Etiam tempor, est non eleifend varius, ipsum nunc cursus turpis, ut tristique risus nisl vel lectus. Praesent et sagittis leo. Integer maximus, purus id aliquet lacinia, eros urna gravida turpis, et tincidunt turpis arcu ac mauris.']
  );

INSERT INTO
  event_categories (
    event,
    name,
    description,
    price
  )
VALUES
  (
    1,
    'category1',
    'this is a description',
    200
  ),
  (
    1,
    'category2',
    'this is a description',
    300
  ),
  (
    1,
    'category3',
    'this is a description',
    400
  ),
  (
    2,
    'category1',
    'this is a description',
    600
  );

INSERT INTO
  offers (
    name,
    description,
    image,
    discount_type,
    discount,
    coupon_code,
    date_range,
    city,
    sport,
    arena,
    event
  )
VALUES
  (
    'FTS01',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/sRLfHJQ.jpg',
    'percent',
    20,
    'xxx1',
    DATERANGE('2018-01-01', '2020-01-01'),
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'FTS02',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/lcLZ3rf.jpg',
    'percent',
    30,
    'xxx2',
    DATERANGE('2018-01-01', '2020-01-01'),
    'Delhi',
    NULL,
    NULL,
    NULL
  ),
  (
    'FTS03',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/sRLfHJQ.jpg',
    'percent',
    80,
    'xxx3',
    DATERANGE('2020-01-01', '2020-12-01'),
    'Delhi',
    NULL,
    NULL,
    NULL
  ),
  (
    'FTS04',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/lcLZ3rf.jpg',
    'amount',
    300,
    'xxx4',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    'Football',
    NULL,
    NULL
  ),
  (
    'FTS05',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/sRLfHJQ.jpg',
    'amount',
    300,
    'xxx5',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    'Tennis',
    NULL,
    NULL
  ),
  (
    'FTS06',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/lcLZ3rf.jpg',
    'amount',
    600,
    'xxx6',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    NULL,
    1,
    NULL
  ),
  (
    'FTS07',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/lcLZ3rf.jpg',
    'amount',
    800,
    'xxx7',
    DATERANGE('2017-01-01', '2020-12-01'),
    'Mumbai',
    NULL,
    NULL,
    NULL
  ),
  (
    'FTS08',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/lcLZ3rf.jpg',
    'amount',
    300,
    'xxx8',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    NULL,
    2,
    NULL
  ),
  (
    'FTS09',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/sRLfHJQ.jpg',
    'percent',
    30,
    'xxx9',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    'Basketball',
    NULL,
    NULL
  ),
  (
    'FTS10',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/sRLfHJQ.jpg',
    'percent',
    30,
    'xx10',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    NULL,
    NULL,
    1
  ),
  (
    'FTS11',
    'bla bla bla bla bla bla bla bla',
    'https://i.imgur.com/sRLfHJQ.jpg',
    'percent',
    30,
    'xx11',
    DATERANGE('2017-01-01', '2020-12-01'),
    NULL,
    NULL,
    NULL,
    2
  );

-- INSERT INTO
--   reviews (arena, reviewer, body, rating)
-- VALUES
--   (1, 1, 'this is a review', 4),
--   (1, 2, 'this is another review', 3);