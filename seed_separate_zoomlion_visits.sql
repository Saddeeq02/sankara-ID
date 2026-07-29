-- Delete previous combined activity
DELETE FROM public."activities" WHERE slug = 'managing-director-zoomlion-china-business-trip-2026';

INSERT INTO public."activities" (
    "title", "slug", "date", "content", "image", "created_at", "updated_at", "summary", "category", "video_url", "description"
) VALUES (
    'Visit to Zoomlion Heavy Industrial Park & Assembly Line',
    'visit-to-zoomlion-industrial-park-assembly-line',
    'July 2026',
    'Technical tour and inspection of Zoomlion combine harvester manufacturing lines, robotics assembly hubs, and quality control systems in China.',
    '["/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.10 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.19 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.20 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.21 PM.jpeg"]',
    NOW(),
    NOW(),
    'Inspection of Zoomlion combine harvester manufacturing and assembly facilities in China.',
    'Our Company',
    NULL,
    'Technical tour and inspection of Zoomlion combine harvester manufacturing lines, robotics assembly hubs, and quality control systems in China.'
);
INSERT INTO public."activities" (
    "title", "slug", "date", "content", "image", "created_at", "updated_at", "summary", "category", "video_url", "description"
) VALUES (
    'Visit to Zoomlion Executive Headquarters & Strategic Exchange',
    'visit-to-zoomlion-executive-headquarters',
    'July 2026',
    'Strategic bilateral partnership meeting and technology exchange with Zoomlion executive leadership to expand modern machinery distribution across West Africa.',
    '["/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.32 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.44 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.28.48 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.29.21 PM.jpeg"]',
    NOW(),
    NOW(),
    'Bilateral partnership meetings and technology exchange with Zoomlion executive management.',
    'Our Company',
    NULL,
    'Strategic bilateral partnership meeting and technology exchange with Zoomlion executive leadership to expand modern machinery distribution across West Africa.'
);
INSERT INTO public."activities" (
    "title", "slug", "date", "content", "image", "created_at", "updated_at", "summary", "category", "video_url", "description"
) VALUES (
    'Visit to Zoomlion Agricultural Equipment Field Operations',
    'visit-to-zoomlion-agricultural-field-operations',
    'July 2026',
    'Field demonstrations, operator ergonomics testing, and performance evaluations for Zoomlion high-horsepower tractors and harvesting equipment.',
    '["/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.29.22 PM (1).jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.29.22 PM (2).jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.29.22 PM.jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.29.23 PM (1).jpeg", "/assets/gallery/OUR_COMPANY_NEW/WhatsApp Image 2026-07-21 at 4.29.23 PM.jpeg"]',
    NOW(),
    NOW(),
    'Field testing and machinery capability assessment for advanced Zoomlion tractors and implements.',
    'Our Company',
    NULL,
    'Field demonstrations, operator ergonomics testing, and performance evaluations for Zoomlion high-horsepower tractors and harvesting equipment.'
);