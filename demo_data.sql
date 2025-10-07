-- After you've signed in once (so your auth.uid() exists), run inserts as that user.
insert into public.expenses (date, category, amount, currency, payer, split_type, custom_pct_to_A, rate_override, amount_base_ILS, share_A, share_B, paid_by_A, paid_by_B, owes_A, owes_B, note, link)
values
('2025-10-01','Taxi', 20, 'USD','A','HALF', null, 3.8, 76, 38, 38, 76, 0, -38, 38, 'Airport taxi', null),
('2025-10-02','Dinner', 1200, 'THB','B','CUSTOM', 70, 0.10, 120, 84, 36, 0, 120, 84, -84, 'Pad Thai & drinks','https://example.com/menu'),
('2025-10-03','Hotel', 100, 'EUR','A','ALL_TO_B', null, 4.0, 400, 0, 400, 400, 0, -400, 400, 'Additional night','https://example.com/hotel');

insert into public.itinerary (type, title, date, start_time, end_time, location, notes, link)
values
('Flight','TLV → ATH', '2025-10-04','06:15','09:00','Ben Gurion T3','Aegean 931','https://example.com/flight'),
('Hotel','Check-in: Athens Center','2025-10-04','14:00',null,'Athens Center Hotel',null,'https://example.com/booking');

insert into public.links (type, name, url, status, notes)
values
('Flight','Aegean e-ticket','https://example.com/aegean','Booked',null),
('Hotel','Athens Center Booking','https://example.com/booking','Booked','Non-refundable');
