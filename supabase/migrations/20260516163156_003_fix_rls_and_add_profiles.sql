/*
  # Fix RLS policies and add user profiles table

  1. Security Fixes
    - Add INSERT policy for order_items (was missing - caused order creation to fail)
    - Remove UPDATE policy from orders (users should not change their own order status)
    - Add unique constraint on cart_items (user_id, product_id) to prevent duplicates

  2. New Tables
    - `profiles` - stores user profile information
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Important Notes
    - The missing INSERT policy on order_items was the root cause of order creation failures
    - Users can now only INSERT order_items for their own orders
    - Order status changes should only happen server-side (edge functions), not from client
*/

-- Fix order_items: add INSERT policy
CREATE POLICY "Users can add items to own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Fix orders: remove dangerous UPDATE policy (users shouldn't change order status)
DROP POLICY IF EXISTS "Users can update own orders" ON orders;

-- Add unique constraint on cart_items to prevent duplicate product entries per user
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_product_unique
  ON cart_items (user_id, product_id);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
