-- Xplorex Travel Website Database Schema (UPDATED)
-- Updated to match the current admin form structure
-- This file contains all necessary Supabase tables based on the simplified application requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (NO CHANGES)
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
-- PACKAGES TABLE (UPDATED)
-- =============================================
-- Changes:
-- - Removed: people (moved to deal-specific pricing)
-- - Removed: price, price_value (moved to individual deals)
-- - Removed: rating, reviews_count (can be calculated from reviews table)
-- - Removed: highlights (not used in current form)
-- - Removed: features (not used in current form)
-- - Kept: All fields that are in the current form
CREATE TABLE packages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Basic Information (Step 1)
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- International, Domestic, etc.
    hero_type VARCHAR(50) NOT NULL, -- beach, mountain, city, etc.
    popular BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    description TEXT,
    availability VARCHAR(50) DEFAULT 'Available' CHECK (availability IN ('Available', 'Limited', 'Sold Out')),
    
    -- Location Information
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    
    -- Images
    images JSONB, -- Array of image URLs
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PACKAGE DEALS TABLE (UPDATED)
-- =============================================
-- Changes:
-- - Added: deal_price (individual pricing per deal period)
-- - Pricing is now per deal period, not global
CREATE TABLE package_deals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    deal_start_date DATE NOT NULL,
    deal_end_date DATE NOT NULL,
    slots_available INTEGER DEFAULT 0,
    slots_booked INTEGER DEFAULT 0,
    deal_price DECIMAL(10,2) NOT NULL, -- Price in PHP for this specific deal period
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_deal_dates CHECK (deal_end_date >= deal_start_date),
    CONSTRAINT check_slots CHECK (slots_booked <= slots_available)
);

-- =============================================
-- PACKAGE DETAILS TABLE (UPDATED)
-- =============================================
-- Changes:
-- - Simplified section_types to match current form
-- - Removed: accommodation (now uses 'inclusions')
-- - Removed: activities (now uses 'exclusions')
-- - Kept: transportation, inclusions, exclusions
-- - Description field is now optional (not used in current form)
CREATE TABLE package_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL, -- 'transportation', 'inclusions', 'exclusions'
    title VARCHAR(255) NOT NULL,
    description TEXT, -- Optional, kept for backward compatibility
    
    -- Transportation specific
    local TEXT, -- Local transportation info
    amenities JSONB, -- Array of amenities/features
    
    -- Inclusions/Exclusions specific
    items JSONB, -- Array of included/excluded items
    
    -- Activities/Tours (if needed in future)
    tours JSONB, -- Array of tour activities (optional)
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PACKAGE ITINERARY TABLE (NO CHANGES)
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
-- BOOKINGS TABLE (UPDATED)
-- =============================================
-- Changes:
-- - base_price now references deal_price from package_deals
-- - No longer needs people count from packages table
create table public.bookings (
  id uuid not null default extensions.uuid_generate_v4 (),
  booking_number character varying(50) not null,
  user_id uuid null,
  package_id uuid null,
  deal_id uuid null,
  customer_first_name character varying(100) not null,
  customer_last_name character varying(100) not null,
  customer_email character varying(255) not null,
  customer_phone character varying(20) not null,
  check_in_date date not null,
  check_out_date date not null,
  total_guests character varying(50) null,
  status character varying(20) null default 'pending'::character varying,
  booking_type character varying(20) null default 'upcoming'::character varying,
  base_price numeric(10, 2) not null,
  discount numeric(10, 2) null default 0.00,
  total_amount numeric(10, 2) not null,
  payment_status character varying(20) null default 'pending'::character varying,
  amount_paid numeric(10, 2) null default 0.00,
  remaining_balance numeric(10, 2) null default 0.00,
  payment_due_date date null,
  booking_date timestamp with time zone null default now(),
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint bookings_pkey primary key (id),
  constraint bookings_booking_number_key unique (booking_number),
  constraint bookings_package_id_fkey foreign KEY (package_id) references packages (id) on delete CASCADE,
  constraint bookings_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint bookings_deal_id_fkey foreign KEY (deal_id) references package_deals (id) on delete set null,
  constraint bookings_payment_status_check check (
    (
      (payment_status)::text = any (
        (
          array[
            'pending'::character varying,
            'needs_payment'::character varying,
            'partial'::character varying,
            'paid'::character varying,
            'failed'::character varying,
            'refunded'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint bookings_status_check check (
    (
      (status)::text = any (
        (
          array[
            'pending'::character varying,
            'confirmed'::character varying,
            'cancelled'::character varying,
            'completed'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint bookings_booking_type_check check (
    (
      (booking_type)::text = any (
        (
          array[
            'upcoming'::character varying,
            'past'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;
-- =============================================
-- PAYMENTS TABLE (NO CHANGES)
-- =============================================
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Payment Details
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'paypal', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP', -- Changed default to PHP
    
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
-- REVIEWS TABLE (NO CHANGES)
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
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
    helpful_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE (NO CHANGES)
-- =============================================
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'booking', 'payment', 'review', 'system'
    
    -- Related Reference
    reference_type VARCHAR(50), -- e.g., 'booking', 'payment', 'review'
    reference_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Packages indexes
CREATE INDEX idx_packages_category ON packages(category);
CREATE INDEX idx_packages_availability ON packages(availability);
CREATE INDEX idx_packages_popular ON packages(popular);
CREATE INDEX idx_packages_featured ON packages(featured);
CREATE INDEX idx_packages_hero_type ON packages(hero_type);
CREATE INDEX idx_packages_country ON packages(country);

-- Package deals indexes
CREATE INDEX idx_package_deals_package_id ON package_deals(package_id);
CREATE INDEX idx_package_deals_dates ON package_deals(deal_start_date, deal_end_date);
CREATE INDEX idx_package_deals_is_active ON package_deals(is_active);

-- Package details indexes
CREATE INDEX idx_package_details_package_id ON package_details(package_id);
CREATE INDEX idx_package_details_section_type ON package_details(section_type);

-- Package itinerary indexes
CREATE INDEX idx_package_itinerary_package_id ON package_itinerary(package_id);
CREATE INDEX idx_package_itinerary_day_number ON package_itinerary(day_number);

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_deal_id ON bookings(deal_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);

-- Payments indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Reviews indexes
CREATE INDEX idx_reviews_package_id ON reviews(package_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- =============================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_deals_updated_at BEFORE UPDATE ON package_deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- MIGRATION NOTES
-- =============================================
-- To migrate from old schema to new schema:
--
-- 1. PACKAGES TABLE CHANGES:
--    ALTER TABLE packages DROP COLUMN IF EXISTS people;
--    ALTER TABLE packages DROP COLUMN IF EXISTS price;
--    ALTER TABLE packages DROP COLUMN IF EXISTS price_value;
--    ALTER TABLE packages DROP COLUMN IF EXISTS rating;
--    ALTER TABLE packages DROP COLUMN IF EXISTS reviews_count;
--    ALTER TABLE packages DROP COLUMN IF EXISTS highlights;
--    ALTER TABLE packages DROP COLUMN IF EXISTS features;
--
-- 2. PACKAGE_DEALS TABLE CHANGES:
--    ALTER TABLE package_deals ADD COLUMN IF NOT EXISTS deal_price DECIMAL(10,2);
--    UPDATE package_deals SET deal_price = 25000.00 WHERE deal_price IS NULL; -- Set default or migrate from packages.price_value
--    ALTER TABLE package_deals ALTER COLUMN deal_price SET NOT NULL;
--
-- 3. PAYMENTS TABLE CHANGES:
--    ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'PHP';
