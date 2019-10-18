CREATE TRIGGER copy_date_and_unnullify_players_trigger BEFORE
INSERT
  ON arena_time_slots FOR EACH ROW EXECUTE PROCEDURE copy_date_and_unnullify_players();
--
--
--
CREATE TRIGGER insert_arena_into_organizers_and_complexes_trigger AFTER
INSERT
  ON arenas FOR EACH ROW EXECUTE PROCEDURE insert_arena_into_organizers_and_complexes();
--
--
--
CREATE TRIGGER check_if_can_add_event_category_trigger BEFORE 
INSERT
 ON event_categories FOR EACH ROW EXECUTE PROCEDURE check_if_can_add_event_category();
--
--
--
CREATE TRIGGER check_if_can_add_court_to_arena_time_slots_trigger BEFORE 
INSERT
 ON arena_time_slots FOR EACH ROW EXECUTE PROCEDURE check_if_can_add_court_to_arena_time_slots();
--
--
--
CREATE TRIGGER check_if_can_add_membership_or_coaching_trigger BEFORE 
INSERT
 ON arena_time_slots FOR EACH ROW EXECUTE PROCEDURE check_if_can_add_membership_or_coaching();
--
--
--
CREATE TRIGGER copy_field_info_trigger BEFORE
INSERT
  ON registration_form_submission_fields FOR EACH ROW EXECUTE PROCEDURE copy_field_info();
--
--
--
CREATE TRIGGER create_cart_trigger AFTER
INSERT
  ON users FOR EACH ROW EXECUTE PROCEDURE create_cart();
--
--
--
CREATE TRIGGER cart_item_init_trigger BEFORE
INSERT
  ON cart_items FOR EACH ROW EXECUTE PROCEDURE cart_item_init();
--
--
--
CREATE TRIGGER check_if_can_update_cart_points_trigger BEFORE
INSERT OR UPDATE
  ON carts FOR EACH ROW EXECUTE PROCEDURE check_if_can_update_cart_points();
--
--
--
CREATE TRIGGER check_if_user_can_review_trigger BEFORE 
INSERT 
  ON reviews FOR EACH ROW EXECUTE PROCEDURE check_if_user_can_review();
--
--
--