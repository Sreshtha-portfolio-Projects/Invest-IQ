-- Invest IQ Database Schema
-- PostgreSQL (Supabase)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    industry VARCHAR(100),
    market_cap BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ticker for fast lookups
CREATE INDEX idx_companies_ticker ON companies(ticker);
CREATE INDEX idx_companies_sector ON companies(sector);

-- Stock prices table (time-series optimized)
CREATE TABLE stock_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    open DECIMAL(12, 2) NOT NULL,
    high DECIMAL(12, 2) NOT NULL,
    low DECIMAL(12, 2) NOT NULL,
    close DECIMAL(12, 2) NOT NULL,
    volume BIGINT NOT NULL,
    CONSTRAINT unique_price_entry UNIQUE (company_id, timestamp)
);

-- Indexes for time-series queries
CREATE INDEX idx_stock_prices_company_id ON stock_prices(company_id);
CREATE INDEX idx_stock_prices_timestamp ON stock_prices(timestamp DESC);
CREATE INDEX idx_stock_prices_company_timestamp ON stock_prices(company_id, timestamp DESC);

-- Financials table
CREATE TABLE financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    revenue BIGINT,
    net_income BIGINT,
    eps DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_financial_entry UNIQUE (company_id, year)
);

CREATE INDEX idx_financials_company_id ON financials(company_id);
CREATE INDEX idx_financials_year ON financials(year DESC);

-- Financial ratios table
CREATE TABLE financial_ratios (
    company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
    pe_ratio DECIMAL(10, 2),
    roe DECIMAL(10, 2),
    debt_to_equity DECIMAL(10, 2),
    revenue_growth DECIMAL(10, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_financial_ratios_pe ON financial_ratios(pe_ratio);
CREATE INDEX idx_financial_ratios_roe ON financial_ratios(roe);

-- Earnings calls table
CREATE TABLE earnings_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quarter VARCHAR(10) NOT NULL,
    transcript TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_earnings_call UNIQUE (company_id, quarter)
);

CREATE INDEX idx_earnings_calls_company_id ON earnings_calls(company_id);

-- Watchlists table
CREATE TABLE watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);

-- Watchlist items table
CREATE TABLE watchlist_items (
    watchlist_id UUID NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (watchlist_id, company_id)
);

CREATE INDEX idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_company_id ON watchlist_items(company_id);

-- Insert some sample Indian market companies for testing
INSERT INTO companies (ticker, name, sector, industry, market_cap) VALUES
('RELIANCE.NS', 'Reliance Industries', 'Energy', 'Oil & Gas', 15000000000000),
('TCS.NS', 'Tata Consultancy Services', 'Technology', 'IT Services', 12000000000000),
('INFY.NS', 'Infosys', 'Technology', 'IT Services', 6000000000000),
('HDFCBANK.NS', 'HDFC Bank', 'Financial Services', 'Banking', 9000000000000),
('ICICIBANK.NS', 'ICICI Bank', 'Financial Services', 'Banking', 7000000000000),
('HINDUNILVR.NS', 'Hindustan Unilever', 'Consumer Goods', 'FMCG', 6500000000000),
('ITC.NS', 'ITC Limited', 'Consumer Goods', 'Diversified', 5500000000000),
('BHARTIARTL.NS', 'Bharti Airtel', 'Telecommunication', 'Telecom Services', 6000000000000),
('SBIN.NS', 'State Bank of India', 'Financial Services', 'Banking', 5000000000000),
('WIPRO.NS', 'Wipro', 'Technology', 'IT Services', 2500000000000);
