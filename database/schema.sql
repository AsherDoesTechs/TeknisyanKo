-- =====================================================
-- TEKNISYANKO DATABASE
-- Initial Database Schema
-- =====================================================

CREATE DATABASE IF NOT EXISTS teknisyanko
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE teknisyanko;

-- =====================================================
-- 1. USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role ENUM('customer', 'technician', 'admin')
        NOT NULL DEFAULT 'customer',

    account_status ENUM('active', 'inactive', 'suspended')
        NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TECHNICIAN PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS technician_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,

    bio TEXT,
    years_of_experience SMALLINT UNSIGNED DEFAULT 0,
    profile_image VARCHAR(500),

    verification_status ENUM(
        'pending',
        'verified',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_technician_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================================
-- 3. SERVICE CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS service_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. SERVICES
-- =====================================================

CREATE TABLE IF NOT EXISTS services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    technician_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,

    service_name VARCHAR(150) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_service_technician
        FOREIGN KEY (technician_id)
        REFERENCES technician_profiles(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_service_category
        FOREIGN KEY (category_id)
        REFERENCES service_categories(id)
        ON DELETE RESTRICT,

    INDEX idx_services_technician (technician_id),
    INDEX idx_services_category (category_id)
);

-- =====================================================
-- 5. BOOKINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT UNSIGNED NOT NULL,
    technician_id BIGINT UNSIGNED NOT NULL,
    service_id BIGINT UNSIGNED NOT NULL,

    booking_reference VARCHAR(30) NOT NULL UNIQUE,

    scheduled_at DATETIME NOT NULL,
    service_address TEXT NOT NULL,
    service_description TEXT,

    status ENUM(
        'pending',
        'accepted',
        'in_progress',
        'completed',
        'cancelled',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    estimated_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_booking_technician
        FOREIGN KEY (technician_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_booking_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT,

    INDEX idx_bookings_customer (customer_id),
    INDEX idx_bookings_technician (technician_id),
    INDEX idx_bookings_status (status),
    INDEX idx_bookings_schedule (scheduled_at)
);

-- =====================================================
-- 6. REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    booking_id BIGINT UNSIGNED NOT NULL UNIQUE,
    customer_id BIGINT UNSIGNED NOT NULL,
    technician_id BIGINT UNSIGNED NOT NULL,

    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_review_rating
        CHECK (rating BETWEEN 1 AND 5),

    CONSTRAINT fk_review_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_review_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_review_technician
        FOREIGN KEY (technician_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    INDEX idx_reviews_technician (technician_id)
);

-- =====================================================
-- DATABASE SCHEMA COMPLETED
-- =====================================================