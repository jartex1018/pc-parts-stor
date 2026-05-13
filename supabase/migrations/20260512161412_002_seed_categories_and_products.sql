/*
  # Seed Categories and Products

  1. Inserts PC component categories
  2. Inserts realistic PC parts with pricing and specs
  3. Includes diverse brands and price points
*/

-- Insert categories
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
('Processors', 'processors', 'CPUs for gaming and productivity', 'Cpu', 1),
('Graphics Cards', 'graphics-cards', 'GPUs for gaming and rendering', 'Zap', 2),
('Memory', 'memory', 'RAM for faster performance', 'Layers', 3),
('Storage', 'storage', 'SSDs and HDDs for data storage', 'Database', 4),
('Motherboards', 'motherboards', 'Mainboards for system building', 'LayoutGrid', 5),
('Power Supplies', 'power-supplies', 'PSUs for reliable power delivery', 'Zap', 6),
('Cooling', 'cooling', 'CPU and case coolers', 'Wind', 7),
('Cases', 'cases', 'Computer cases and chassis', 'Box', 8)
ON CONFLICT (name) DO NOTHING;

-- Insert Processors
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Intel Core i9-13900K',
  'High-end processor for gaming and content creation. 24 cores, 32 threads, 5.8 GHz boost.',
  589.99,
  12,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'processors'),
  'Intel',
  '{"cores": 24, "threads": 32, "base_clock": "3.0 GHz", "boost_clock": "5.8 GHz", "tdp": "253W", "socket": "LGA1700"}'::jsonb,
  'INTEL-I9-13900K'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'AMD Ryzen 9 7950X',
  'Premium processor with 16 cores and 32 threads, perfect for streaming and gaming.',
  549.99,
  8,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'processors'),
  'AMD',
  '{"cores": 16, "threads": 32, "base_clock": "4.5 GHz", "boost_clock": "5.7 GHz", "tdp": "162W", "socket": "AM5"}'::jsonb,
  'AMD-RYZEN-7950X'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Intel Core i7-13700K',
  'Excellent mid-range processor with 16 cores and 24 threads for gaming.',
  419.99,
  15,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'processors'),
  'Intel',
  '{"cores": 16, "threads": 24, "base_clock": "3.4 GHz", "boost_clock": "5.4 GHz", "tdp": "253W", "socket": "LGA1700"}'::jsonb,
  'INTEL-I7-13700K'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Graphics Cards
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'NVIDIA RTX 4090',
  'Top-tier GPU with 24GB GDDR6X memory. Extreme performance for 4K gaming and AI workloads.',
  1799.99,
  5,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'graphics-cards'),
  'NVIDIA',
  '{"memory": "24GB GDDR6X", "cores": 16384, "base_clock": "2.23 GHz", "boost_clock": "2.52 GHz", "power": "450W", "interface": "PCIe 4.0"}'::jsonb,
  'NVIDIA-RTX4090'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'NVIDIA RTX 4080',
  'High-end GPU with 16GB GDDR6X. Perfect for 1440p and 4K gaming at high refresh rates.',
  1199.99,
  10,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'graphics-cards'),
  'NVIDIA',
  '{"memory": "16GB GDDR6X", "cores": 10240, "base_clock": "2.5 GHz", "boost_clock": "2.7 GHz", "power": "320W", "interface": "PCIe 4.0"}'::jsonb,
  'NVIDIA-RTX4080'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'AMD Radeon RX 7900 XTX',
  'Powerful AMD GPU with 24GB GDDR6. Excellent value for high-end gaming.',
  849.99,
  7,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'graphics-cards'),
  'AMD',
  '{"memory": "24GB GDDR6", "cores": 6144, "base_clock": "2.5 GHz", "boost_clock": "2.72 GHz", "power": "420W", "interface": "PCIe 4.0"}'::jsonb,
  'AMD-RX7900XTX'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Memory (RAM)
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Corsair Vengeance RGB Pro 32GB DDR5',
  'High-performance DDR5 RAM with RGB lighting. 32GB capacity for gaming and multitasking.',
  179.99,
  20,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'memory'),
  'Corsair',
  '{"capacity": "32GB", "speed": "6000MHz", "type": "DDR5", "cas_latency": 30, "form_factor": "DIMM"}'::jsonb,
  'CORSAIR-VRP-32G-DDR5'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'G.Skill Trident Z5 64GB DDR5',
  'Ultra-fast DDR5 RAM with 64GB capacity. Perfect for content creators and heavy workloads.',
  349.99,
  12,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'memory'),
  'G.Skill',
  '{"capacity": "64GB", "speed": "6400MHz", "type": "DDR5", "cas_latency": 32, "form_factor": "DIMM"}'::jsonb,
  'GSKILL-TZ5-64G'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Kingston Fury Beast 32GB DDR4',
  'Reliable DDR4 RAM with 32GB capacity. Great for budget builds and older systems.',
  99.99,
  25,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'memory'),
  'Kingston',
  '{"capacity": "32GB", "speed": "3200MHz", "type": "DDR4", "cas_latency": 16, "form_factor": "DIMM"}'::jsonb,
  'KINGSTON-FURY-32G-DDR4'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Storage
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Samsung 990 Pro 4TB NVMe SSD',
  'Ultra-fast PCIe 4.0 NVMe SSD with 4TB capacity. Great for gaming and 4K video work.',
  349.99,
  18,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'storage'),
  'Samsung',
  '{"capacity": "4TB", "interface": "NVMe PCIe 4.0", "read_speed": "7100MB/s", "write_speed": "6000MB/s", "form_factor": "M.2"}'::jsonb,
  'SAMSUNG-990PRO-4TB'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'WD Black SN850X 2TB',
  'High-performance NVMe SSD with 2TB capacity. Ideal for gaming systems.',
  179.99,
  22,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'storage'),
  'Western Digital',
  '{"capacity": "2TB", "interface": "NVMe PCIe 4.0", "read_speed": "7100MB/s", "write_speed": "6000MB/s", "form_factor": "M.2"}'::jsonb,
  'WD-BLACK-SN850X-2TB'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Seagate Barracuda 4TB HDD',
  'Large capacity mechanical hard drive for storage. 4TB capacity at budget-friendly price.',
  79.99,
  30,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'storage'),
  'Seagate',
  '{"capacity": "4TB", "type": "HDD", "rpm": 5400, "cache": "256MB", "interface": "SATA"}'::jsonb,
  'SEAGATE-BARRACUDA-4TB'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Motherboards
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'ASUS ROG Maximus Z790-E',
  'Premium LGA1700 motherboard with PCIe 5.0 support and robust power delivery.',
  389.99,
  8,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'motherboards'),
  'ASUS',
  '{"socket": "LGA1700", "chipset": "Z790", "form_factor": "ATX", "pcie": "5.0", "ram_slots": 4, "max_ram": "192GB"}'::jsonb,
  'ASUS-ROG-Z790-E'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'MSI MPG B850-E EDGE WIFI',
  'High-quality AM5 motherboard with WiFi and good power delivery for Ryzen processors.',
  279.99,
  10,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'motherboards'),
  'MSI',
  '{"socket": "AM5", "chipset": "B850E", "form_factor": "ATX", "pcie": "5.0", "ram_slots": 4, "max_ram": "192GB", "wifi": true}'::jsonb,
  'MSI-MPG-B850E-WIFI'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Power Supplies
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Corsair HX1200 Platinum',
  '1200W fully modular power supply with 80+ Platinum certification and 10-year warranty.',
  239.99,
  12,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'power-supplies'),
  'Corsair',
  '{"wattage": "1200W", "efficiency": "80+ Platinum", "modular": "full", "form_factor": "ATX", "warranty": "10 years"}'::jsonb,
  'CORSAIR-HX1200-PLATINUM'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'EVGA SuperNOVA 850 G6',
  '850W fully modular power supply with 80+ Gold efficiency. Reliable and affordable.',
  124.99,
  20,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'power-supplies'),
  'EVGA',
  '{"wattage": "850W", "efficiency": "80+ Gold", "modular": "full", "form_factor": "ATX", "warranty": "7 years"}'::jsonb,
  'EVGA-SUPERNOVA-850G6'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Cooling
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Noctua NH-D15 Chromax',
  'Premium dual-tower CPU cooler with excellent cooling performance and quiet operation.',
  109.95,
  14,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'cooling'),
  'Noctua',
  '{"type": "air", "socket": "LGA1700/AM5", "tdp": "250W", "height": "160mm", "noise": "24.6 dB"}'::jsonb,
  'NOCTUA-NH-D15'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Corsair iCUE H150i Elite Capellix XT',
  '360mm AIO liquid cooler with RGB lighting and excellent cooling performance.',
  189.99,
  11,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'cooling'),
  'Corsair',
  '{"type": "liquid", "radiator": "360mm", "socket": "LGA1700/AM5", "tdp": "250W", "rgb": true}'::jsonb,
  'CORSAIR-H150I-ELITE-XT'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Cases
INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'NZXT H7 Flow RGB',
  'Beautiful mid-tower case with excellent airflow and RGB lighting.',
  149.99,
  16,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'cases'),
  'NZXT',
  '{"type": "mid-tower", "motherboard": "up to ATX", "gpu_clearance": "330mm", "radiator_support": "280/360mm front", "drive_bays": "2x 3.5\" + 2x 2.5\""}'::jsonb,
  'NZXT-H7-FLOW-RGB'
)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category_id, brand, specs, sku)
VALUES (
  'Corsair 5000T RGB',
  'Premium mid-tower case with exceptional build quality and tempered glass.',
  299.99,
  9,
  'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400',
  (SELECT id FROM categories WHERE slug = 'cases'),
  'Corsair',
  '{"type": "mid-tower", "motherboard": "up to E-ATX", "gpu_clearance": "360mm", "radiator_support": "360mm front/top", "tempered_glass": true, "rgb": true}'::jsonb,
  'CORSAIR-5000T-RGB'
)
ON CONFLICT (sku) DO NOTHING;