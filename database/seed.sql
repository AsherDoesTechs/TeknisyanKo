USE teknisyanko;

INSERT INTO service_categories (name, description, icon)
VALUES
(
    'Electrical Services',
    'Electrical installation, wiring, troubleshooting, and repairs.',
    'zap'
),
(
    'Plumbing Services',
    'Pipe installation, leak repairs, faucet repairs, and plumbing maintenance.',
    'droplets'
),
(
    'Appliance Repair',
    'Repair and maintenance of refrigerators, washing machines, and other appliances.',
    'washing-machine'
),
(
    'Air Conditioning',
    'Air conditioner installation, cleaning, maintenance, and repair.',
    'air-vent'
),
(
    'Carpentry',
    'Furniture repair, woodwork, cabinet installation, and carpentry services.',
    'hammer'
),
(
    'Painting Services',
    'Interior and exterior painting, repainting, and surface preparation.',
    'paint-roller'
),
(
    'Cleaning Services',
    'Residential cleaning and general property maintenance.',
    'brush'
),
(
    'Computer and IT Services',
    'Computer troubleshooting, hardware repair, software installation, and technical support.',
    'monitor'
)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    icon = VALUES(icon);