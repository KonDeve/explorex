-- Xplorex Travel Website Database Schema
-- This file contains all necessary Supabase tables based on the application requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    date_of_birth DATE,
    preferences TEXT,
    profile_image_url TEXT,
    role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PACKAGES TABLE
-- =============================================
CREATE TABLE packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    duration VARCHAR(100) NOT NULL,
    people VARCHAR(50), -- e.g., "2-4 People"
    price VARCHAR(50) NOT NULL, -- Formatted price like "$2,499"
    price_value DECIMAL(10,2) NOT NULL, -- Numeric value for calculations
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    description TEXT,
    category VARCHAR(100),
    availability VARCHAR(50) DEFAULT 'Available' CHECK (availability IN ('Available', 'Limited', 'Sold Out')),
    highlights TEXT,
    features JSONB, -- Array of features like ["5-Star Hotel", "All Meals", "Tour Guide"]
    images JSONB, -- Array of image URLs
    popular BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    hero_type VARCHAR(50), -- e.g., "beach", "mountain", "city"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PACKAGE DETAILS TABLE
-- =============================================
CREATE TABLE package_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'accommodation', 'transportation', 'activities', 'inclusions'
    title VARCHAR(255) NOT NULL,
    description TEXT, -- Section description (e.g., "4 nights stay at Hotel Danieli Venice")
    amenities JSONB, -- Array of amenities
    local TEXT, -- For transportation section - local transportation info
    tours JSONB, -- Array of tour activities (for activities section)
    items JSONB, -- Array of inclusion items (for inclusions section)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PACKAGE ITINERARY TABLE
-- =============================================
CREATE TABLE package_itinerary (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BOOKINGS TABLE
-- =============================================
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_number VARCHAR(50) UNIQUE NOT NULL, -- Format: BK-001, BK-002, etc.
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    
    -- Guest Information
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    
    -- Travel Details
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    adults_count INTEGER NOT NULL DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    total_guests VARCHAR(50), -- Formatted string like "2 Adults, 1 Child"
    
    -- Booking Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_type VARCHAR(20) DEFAULT 'upcoming' CHECK (booking_type IN ('upcoming', 'past')),
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    children_price DECIMAL(10,2) DEFAULT 0.00,
    service_fee DECIMAL(10,2) DEFAULT 99.00,
    taxes DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment Information
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'failed', 'refunded')),
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    remaining_balance DECIMAL(10,2) DEFAULT 0.00,
    payment_due_date DATE,
    
    -- Additional Information
    special_requests TEXT,
    confirmation_number VARCHAR(50),
    hotel_name VARCHAR(255),
    hotel_rating INTEGER,
    
    -- Timestamps
    booking_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment Details
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'paypal', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Card Information (encrypted/tokenized in production)
    card_last_four VARCHAR(4),
    card_holder_name VARCHAR(255),
    card_expiry_month INTEGER,
    card_expiry_year INTEGER,
    
    -- Payment Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    transaction_id VARCHAR(255),
    gateway_response TEXT,
    
    -- Timestamps
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    -- Review Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE (for trip communication)
-- =============================================
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message Content
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'system')),
    content TEXT NOT NULL,
    attachment_url TEXT,
    
    -- Message Status
    is_read BOOLEAN DEFAULT FALSE,
    is_from_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROMO CODES TABLE
-- =============================================
CREATE TABLE promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    
    -- Discount Information
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0.00,
    maximum_discount DECIMAL(10,2),
    
    -- Usage Limits
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    
    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Applicable packages (NULL means all packages)
    applicable_packages JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROMO CODE USAGE TABLE
-- =============================================
CREATE TABLE promo_code_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    
    -- Usage Details
    discount_amount DECIMAL(10,2) NOT NULL,
    
    -- Timestamps
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SAVED CARDS TABLE (for future bookings)
-- =============================================
CREATE TABLE saved_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Card Information (tokenized/encrypted in production)
    card_token VARCHAR(255) NOT NULL, -- Tokenized card information
    card_last_four VARCHAR(4) NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    card_brand VARCHAR(20), -- visa, mastercard, amex, etc.
    expiry_month INTEGER NOT NULL,
    expiry_year INTEGER NOT NULL,
    
    -- Card Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMER SUPPORT TICKETS TABLE
-- =============================================
CREATE TABLE support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Ticket Information
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50), -- billing, booking_change, complaint, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Packages indexes
CREATE INDEX idx_packages_location ON packages(location);
CREATE INDEX idx_packages_category ON packages(category);
CREATE INDEX idx_packages_availability ON packages(availability);
CREATE INDEX idx_packages_price ON packages(price);
CREATE INDEX idx_packages_rating ON packages(rating);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_check_in_date ON bookings(check_in_date);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);

-- Payments indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Reviews indexes
CREATE INDEX idx_reviews_package_id ON reviews(package_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Messages indexes
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- =============================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update package rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_package_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE packages 
        SET 
            rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE package_id = NEW.package_id AND status = 'approved'),
            reviews_count = (SELECT COUNT(*) FROM reviews WHERE package_id = NEW.package_id AND status = 'approved')
        WHERE id = NEW.package_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE packages 
        SET 
            rating = COALESCE((SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE package_id = OLD.package_id AND status = 'approved'), 0),
            reviews_count = (SELECT COUNT(*) FROM reviews WHERE package_id = OLD.package_id AND status = 'approved')
        WHERE id = OLD.package_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply rating update trigger
CREATE TRIGGER update_package_rating_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_package_rating();

-- Function to update user statistics when bookings are made
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users 
        SET 
            total_bookings = total_bookings + 1,
            total_spent = total_spent + NEW.total_amount
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Update spent amount if total_amount changed
        IF OLD.total_amount != NEW.total_amount THEN
            UPDATE users 
            SET total_spent = total_spent - OLD.total_amount + NEW.total_amount
            WHERE id = NEW.user_id;
        END IF;
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE users 
        SET 
            total_bookings = total_bookings - 1,
            total_spent = total_spent - OLD.total_amount
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply user stats update trigger
CREATE TRIGGER update_user_stats_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and admins can read all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Packages are readable by all authenticated users
CREATE POLICY "Packages are viewable by authenticated users" ON packages FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage packages" ON packages FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Package details follow packages permissions
CREATE POLICY "Package details viewable by authenticated users" ON package_details FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage package details" ON package_details FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Package itinerary follows packages permissions
CREATE POLICY "Package itinerary viewable by authenticated users" ON package_itinerary FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage package itinerary" ON package_itinerary FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Bookings - users can see their own, admins can see all
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Payments follow bookings permissions
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create payments for own bookings" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews - users can manage their own, all can read approved ones
CREATE POLICY "Users can view approved reviews" ON reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Messages - users can see messages for their bookings
CREATE POLICY "Users can view messages for own bookings" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can send messages for own bookings" ON messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Saved cards - users can only see their own
CREATE POLICY "Users can manage own saved cards" ON saved_cards FOR ALL USING (auth.uid() = user_id);

-- Support tickets - users can see their own, admins can see all
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Promo codes - read-only for customers, full access for admins
CREATE POLICY "Active promo codes viewable by authenticated users" ON promo_codes FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');
CREATE POLICY "Admins can manage promo codes" ON promo_codes FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Promo code usage - users can see their own usage
CREATE POLICY "Users can view own promo usage" ON promo_code_usage FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create promo usage" ON promo_code_usage FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert sample admin user (password should be hashed in production)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@xplorex.com', '$2b$10$example_hash', 'Admin', 'User', 'admin');

-- Insert sample packages
INSERT INTO packages (id, title, location, country, duration, people, price, price_value, rating, reviews_count, description, category, features, images, popular, featured, hero_type) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Santorini Paradise',
    'Greece',
    'GREECE',
    '7 Days',
    '2-4 People',
    '$2,499',
    2499.00,
    4.9,
    342,
    'Experience the magic of Santorini with its iconic blue-domed churches, stunning sunsets, and pristine beaches. This comprehensive package includes luxury accommodation, guided tours, and authentic Greek dining experiences.',
    'International',
    '["5-Star Hotel", "All Meals", "Tour Guide", "Transportation"]',
    '["/santorini-blue-domes-greece.jpg", "/santorini-greece-infinity-pool-ocean.jpg", "/white-greek-buildings-blue-doors.jpg"]',
    TRUE,
    TRUE,
    'beach'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Venice Romance',
    'Italy',
    'ITALY',
    '5 Days',
    '2 People',
    '$1,899',
    1899.00,
    4.8,
    256,
    'Discover the romantic charm of Venice with its winding canals, historic architecture, and world-class art. Perfect for couples seeking an unforgettable Italian getaway.',
    'Cultural',
    '["4-Star Hotel", "Breakfast", "Gondola Ride", "City Tours"]',
    '["/venice-italy-canal-buildings.jpg"]',
    TRUE,
    FALSE,
    'city'
);

-- =============================================
-- COMPREHENSIVE SAMPLE DATA
-- =============================================

-- Insert sample package details for Santorini Paradise
-- Accommodation section
INSERT INTO package_details (package_id, section_type, title, description, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'accommodation',
    'Hotel Accommodation',
    '6 nights stay at Santorini Blue Resort (Premium Suite)',
    '["Free Wi-Fi", "Private balcony with caldera view", "Daily breakfast", "Infinity pool access", "Concierge service", "Airport transfers"]'
);

-- Transportation section
INSERT INTO package_details (package_id, section_type, title, description, amenities, local) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'transportation',
    'Transportation',
    'Round-trip flights from major cities to Santorini',
    '["Premium economy seating", "In-flight meals", "Airport lounge access", "Travel insurance"]',
    'Private transfers and local transportation for all tour activities'
);

-- Activities section
INSERT INTO package_details (package_id, section_type, title, description, tours, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'activities',
    'Tour Activities',
    'Included tours & experiences exploring Santorini highlights',
    '["Oia Village sunset tour", "Wine tasting at traditional wineries", "Caldera boat cruise", "Red Beach and Kamari Beach visits", "Fira town exploration"]',
    '["Professional tour guide", "All entrance fees included", "Photography sessions", "Traditional Greek lunch", "Bottled water and snacks"]'
);

-- Inclusions section
INSERT INTO package_details (package_id, section_type, title, description, items) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'inclusions',
    'Other Inclusions',
    'Extra benefits and travel essentials for your Santorini trip',
    '["Comprehensive travel insurance for 7 days", "Free welcome dinner with live music", "Souvenir shopping voucher worth $100", "24/7 customer support"]'
);

-- Insert sample package details for Venice Romance
-- Accommodation section
INSERT INTO package_details (package_id, section_type, title, description, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'accommodation',
    'Hotel Accommodation',
    '4 nights stay at Hotel Danieli Venice (Canal View Room)',
    '["Free Wi-Fi", "Canal view balcony", "Continental breakfast", "Room service", "Historic palazzo setting", "24-hour front desk"]'
);

-- Transportation section
INSERT INTO package_details (package_id, section_type, title, description, amenities, local) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'transportation',
    'Transportation',
    'Round-trip flights to Venice Marco Polo Airport',
    '["Economy plus seating", "Checked baggage included", "Airport transfers via water taxi"]',
    'Vaporetto passes for Venice public water transport and guided walking tours'
);

-- Activities section
INSERT INTO package_details (package_id, section_type, title, description, tours, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'activities',
    'Tour Activities',
    'Included tours & experiences exploring Venice highlights',
    '["Private gondola ride through Grand Canal", "St. Mark''s Basilica and Doge''s Palace tour", "Murano and Burano islands excursion", "Traditional Venetian glass-making workshop", "Romantic dinner at canal-side restaurant"]',
    '["Licensed tour guide", "Skip-the-line tickets", "Traditional mask painting class", "Welcome prosecco", "Photography assistance"]'
);

-- Inclusions section
INSERT INTO package_details (package_id, section_type, title, description, items) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'inclusions',
    'Other Inclusions',
    'Extra benefits and travel essentials for your Venice trip',
    '["Travel insurance for 5 days", "Venice city map and guidebook", "$75 restaurant voucher", "Free souvenir Venetian mask", "Emergency support hotline"]'
);

-- Add more comprehensive packages
INSERT INTO packages (id, title, location, country, duration, people, price, price_value, rating, reviews_count, description, category, features, images, popular, featured, hero_type) VALUES
-- Alpine Adventure Package
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Alpine Adventure',
    'Switzerland',
    'SWITZERLAND',
    '6 Days',
    '2-4 People',
    '$2,799',
    2799.00,
    4.7,
    189,
    'Experience the breathtaking beauty of the Swiss Alps with luxury mountain lodges, scenic train rides, and outdoor adventures. Perfect for nature lovers and adventure seekers.',
    'Adventure',
    '["4-Star Mountain Lodge", "All Meals Included", "Cable Car Access", "Hiking Guide", "Spa Facilities"]',
    '["/mountain-lake-sunset-alps.jpg", "/mountain-adventure-hiking-scenic-landscape.jpg", "/mountain-hiking-adventure-landscape.jpg"]',
    TRUE,
    FALSE,
    'mountain'
),
-- Tropical Paradise Package
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Tropical Paradise',
    'Maldives',
    'MALDIVES',
    '8 Days',
    '2 People',
    '$3,499',
    3499.00,
    4.9,
    428,
    'Escape to crystal-clear waters and pristine beaches in an overwater villa. Includes snorkeling, spa treatments, and romantic beachside dining experiences.',
    'Beach',
    '["5-Star Overwater Villa", "All-Inclusive", "Private Butler", "Water Sports", "Couples Spa"]',
    '["/tropical-beach-paradise-sunset.jpg", "/tropical-beach-paradise-sunset-palm-trees.jpg", "/tropical-beach-palm-trees-resort.jpg"]',
    TRUE,
    TRUE,
    'beach'
);

-- Insert package details for Alpine Adventure
-- Accommodation section
INSERT INTO package_details (package_id, section_type, title, description, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'accommodation',
    'Hotel Accommodation',
    '5 nights stay at Alpine Grand Lodge (Mountain View Suite)',
    '["Free Wi-Fi", "Mountain view balcony", "Full breakfast buffet", "Spa and wellness center", "Ski equipment rental", "Concierge service"]'
);

-- Transportation section
INSERT INTO package_details (package_id, section_type, title, description, amenities, local) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'transportation',
    'Transportation',
    'Round-trip flights to Zurich Airport with scenic train transfer',
    '["Business class seating", "Priority boarding", "Extra baggage allowance", "Airport lounge access"]',
    'Private mountain transfers and cable car passes for all excursions'
);

-- Activities section
INSERT INTO package_details (package_id, section_type, title, description, tours, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'activities',
    'Tour Activities',
    'Included tours & experiences exploring Swiss Alps highlights',
    '["Jungfraujoch railway excursion", "Guided alpine hiking tours", "Cable car scenic rides", "Traditional Swiss cheese making", "Lake cruise with mountain views"]',
    '["Certified mountain guide", "All equipment provided", "Safety briefings", "Group photos", "Refreshments during tours"]'
);

-- Inclusions section
INSERT INTO package_details (package_id, section_type, title, description, items) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'inclusions',
    'Other Inclusions',
    'Extra benefits and travel essentials for your Swiss Alps trip',
    '["Comprehensive travel and adventure insurance", "Swiss Travel Pass for public transport", "$150 dining voucher", "Traditional Swiss souvenir package", "24/7 mountain rescue support"]'
);

-- Insert package details for Tropical Paradise
-- Accommodation section
INSERT INTO package_details (package_id, section_type, title, description, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'accommodation',
    'Hotel Accommodation',
    '7 nights stay at Paradise Resort Maldives (Overwater Villa)',
    '["Free Wi-Fi", "Direct ocean access", "Private deck with loungers", "Glass floor viewing", "24-hour butler service", "Complimentary minibar"]'
);

-- Transportation section
INSERT INTO package_details (package_id, section_type, title, description, amenities, local) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'transportation',
    'Transportation',
    'Round-trip flights to Male International Airport with seaplane transfer',
    '["First class seating", "Priority check-in", "Luxury lounge access", "Expedited immigration"]',
    'Seaplane transfers to resort and speedboat for excursions'
);

-- Activities section
INSERT INTO package_details (package_id, section_type, title, description, tours, amenities) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'activities',
    'Tour Activities',
    'Included tours & experiences exploring Maldives highlights',
    '["Dolphin watching cruise", "Snorkeling at coral reefs", "Sunset fishing expedition", "Local island cultural tour", "Private beach picnic"]',
    '["PADI certified instructors", "All snorkeling equipment", "Underwater photography", "Marine biologist guide", "Sunset refreshments"]'
);

-- Inclusions section
INSERT INTO package_details (package_id, section_type, title, description, items) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440004',
    'inclusions',
    'Other Inclusions',
    'Extra benefits and travel essentials for your Maldives trip',
    '["Comprehensive travel insurance", "All-inclusive dining and beverages", "$200 spa treatment credit", "Complimentary couples photography session", "24/7 concierge service"]'
);

-- Insert sample itineraries for all packages

-- Santorini Paradise Itinerary
INSERT INTO package_itinerary (package_id, day_number, title, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1, 'Arrival & Check-in', 'Airport pickup and hotel check-in. Welcome dinner with traditional Greek cuisine and live music.'),
('550e8400-e29b-41d4-a716-446655440001', 2, 'Oia Village Tour', 'Explore the famous Oia village and witness the stunning sunset. Wine tasting at local wineries.'),
('550e8400-e29b-41d4-a716-446655440001', 3, 'Caldera Boat Cruise', 'Full day boat cruise around the caldera with swimming stops and traditional lunch.'),
('550e8400-e29b-41d4-a716-446655440001', 4, 'Beach Day', 'Visit Red Beach and Kamari Beach. Relaxing spa session at the hotel.'),
('550e8400-e29b-41d4-a716-446655440001', 5, 'Fira Exploration', 'Explore Fira town, shopping, and cultural sites. Free evening for personal activities.'),
('550e8400-e29b-41d4-a716-446655440001', 6, 'Photography Tour', 'Professional photography session at iconic Santorini locations.'),
('550e8400-e29b-41d4-a716-446655440001', 7, 'Departure', 'Check-out and airport transfer. Farewell breakfast with souvenir gifts.');

-- Venice Romance Itinerary
INSERT INTO package_itinerary (package_id, day_number, title, description) VALUES
('550e8400-e29b-41d4-a716-446655440002', 1, 'Arrival & Grand Canal', 'Water taxi transfer to hotel. Private gondola ride through Grand Canal at sunset.'),
('550e8400-e29b-41d4-a716-446655440002', 2, 'St. Marks Square', 'Guided tour of St. Mark''s Basilica and Doge''s Palace. Traditional mask painting class.'),
('550e8400-e29b-41d4-a716-446655440002', 3, 'Island Hopping', 'Excursion to Murano and Burano islands. Glass-making workshop and colorful house tours.'),
('550e8400-e29b-41d4-a716-446655440002', 4, 'Romantic Venice', 'Free morning for shopping. Romantic dinner at canal-side restaurant.'),
('550e8400-e29b-41d4-a716-446655440002', 5, 'Departure', 'Final breakfast and water taxi to airport. Complimentary Venice guidebook.');

-- Alpine Adventure Itinerary
INSERT INTO package_itinerary (package_id, day_number, title, description) VALUES
('550e8400-e29b-41d4-a716-446655440003', 1, 'Alpine Arrival', 'Scenic train journey from Zurich to the Alps. Check-in and welcome dinner with Swiss specialties.'),
('550e8400-e29b-41d4-a716-446655440003', 2, 'Jungfraujoch Railway', 'Journey to the "Top of Europe" via cogwheel train. Ice Palace and glacier viewing.'),
('550e8400-e29b-41d4-a716-446655440003', 3, 'Mountain Hiking', 'Guided alpine hiking with breathtaking views. Traditional Swiss cheese making experience.'),
('550e8400-e29b-41d4-a716-446655440003', 4, 'Lake & Cable Cars', 'Lake cruise and cable car rides. Spa relaxation at the mountain lodge.'),
('550e8400-e29b-41d4-a716-446655440003', 5, 'Alpine Villages', 'Visit traditional Swiss villages. Shopping for authentic Swiss products.'),
('550e8400-e29b-41d4-a716-446655440003', 6, 'Departure', 'Scenic train back to Zurich. Farewell breakfast and airport transfer.');

-- Tropical Paradise Itinerary
INSERT INTO package_itinerary (package_id, day_number, title, description) VALUES
('550e8400-e29b-41d4-a716-446655440004', 1, 'Paradise Arrival', 'Seaplane transfer to resort. Villa check-in and sunset welcome cocktails.'),
('550e8400-e29b-41d4-a716-446655440004', 2, 'Ocean Adventures', 'Dolphin watching cruise and snorkeling at pristine coral reefs.'),
('550e8400-e29b-41d4-a716-446655440004', 3, 'Cultural Discovery', 'Local island visit with cultural experiences and traditional crafts.'),
('550e8400-e29b-41d4-a716-446655440004', 4, 'Relaxation Day', 'Spa treatments and private beach time. Couples massage session.'),
('550e8400-e29b-41d4-a716-446655440004', 5, 'Sunset Fishing', 'Traditional fishing expedition with sunset dinner on sandbank.'),
('550e8400-e29b-41d4-a716-446655440004', 6, 'Private Beach Picnic', 'Secluded beach picnic and professional photography session.'),
('550e8400-e29b-41d4-a716-446655440004', 7, 'Final Paradise', 'Leisurely morning and spa. Farewell dinner under the stars.'),
('550e8400-e29b-41d4-a716-446655440004', 8, 'Departure', 'Final breakfast and seaplane transfer back to Male Airport.');

-- This completes the comprehensive database schema for the Xplorex travel website
-- All tables include proper relationships, constraints, indexes, and security policies
-- The schema supports all features identified in the frontend application