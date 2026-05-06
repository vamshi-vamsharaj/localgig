
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";

// ─── Model imports (adjust paths to match your project structure) ─────────────
import UserModel        from "../lib/models/user";
import TaskModel        from "../lib/models/task";
import ApplicationModel from "../lib/models/application";
import SavedTaskModel   from "../lib/models/savedTask";
import {
    Conversation as ConversationModel,
    Message      as MessageModel,
} from "../lib/models/message";

// ─── Config ───────────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI!;
const AUTH_BASE   = (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "http://localhost:3000"
).replace(/\/$/, "");

const SKIP_WIPE = process.argv.includes("--skip-wipe");

if (!MONGODB_URI) {
    console.error("❌  MONGODB_URI is not set in .env.local");
    process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysFromNow(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
}

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function minutesAfter(base: Date, mins: number): Date {
    return new Date(base.getTime() + mins * 60 * 1000);
}

function pickN<T>(arr: T[], n: number): T[] {
    return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

async function signUpViaApi(
    name:     string,
    email:    string,
    password: string,
): Promise<string> {
    const url = `${AUTH_BASE}/api/auth/sign-up/email`;

    const res = await fetch(url, {
        method:  "POST",
        headers: {
    "Content-Type": "application/json",
    "Origin": AUTH_BASE,
},
        body:    JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
        const body = await res.text().catch(() => "");
        const isConflict =
            res.status === 409 ||
            body.toLowerCase().includes("exist") ||
            body.toLowerCase().includes("already");
        if (isConflict) return "EXISTS";
        throw new Error(`signUp ${email} → HTTP ${res.status}: ${body}`);
    }

    const json = await res.json() as Record<string, unknown>;
    // better-auth returns { user: { id, ... } } or { id, ... }
    const id =
        (json.user as Record<string, unknown> | undefined)?.id as string ??
        (json.id as string | undefined);

    if (!id) throw new Error(`signUp ${email}: no id in response → ${JSON.stringify(json)}`);
    return id;
}

// ─── Seed user definitions ────────────────────────────────────────────────────

interface UserDef {
    name:     string;
    email:    string;
    password: string;
    role:     "both";
    bio:      string;
    phone:    string;
}

const USER_DEFS: UserDef[] = [
    {
        name:     "Arjun Sharma",
        email:    "arjun@localgig.dev",
        password: "Password@123",
        role:     "both",
        bio:      "Experienced professional based in Hyderabad. I post tasks and also take up local gigs when I can.",
        phone:    "+91 98765 43210",
    },
    {
        name:     "Priya Nair",
        email:    "priya@localgig.dev",
        password: "Password@123",
        role:     "both",
        bio:      "Freelancer and task poster from Bangalore. I love connecting clients with skilled local workers.",
        phone:    "+91 87654 32109",
    },
    {
        name:     "Rahul Gupta",
        email:    "rahul@localgig.dev",
        password: "Password@123",
        role:     "both",
        bio:      "Based in Mumbai. I handle home services tasks and local deliveries for clients across the city.",
        phone:    "+91 76543 21098",
    },
];

// ─── Task blueprints ──────────────────────────────────────────────────────────

interface TaskBlueprint {
    title:          string;
    description:    string;
    category:       string;
    budget:         number;
    estimatedHours: number;
    address:        string;
    coords:         [number, number]; // GeoJSON: [lng, lat]
    hasDeadline:    boolean;
    deadlineDays:   number;
    clientIdx:      number;           // index into USER_DEFS
}

const TASK_BLUEPRINTS: TaskBlueprint[] = [
    {
        title:          "Help Moving Furniture to New Flat",
        description:    "Relocating from Banjara Hills to Gachibowli. Need 2–3 strong workers to carry sofa set, double bed, almirah, and dining table. Ground floor to 3rd floor, lift available. No packing required — everything is already boxed.",
        category:       "Moving",
        budget:         2500,
        estimatedHours: 3,
        address:        "Plot 12, Banjara Hills Road No. 1, Hyderabad, Telangana 500034",
        coords:         [78.4483, 17.4126],
        hasDeadline:    true,
        deadlineDays:   5,
        clientIdx:      0,
    },
    {
        title:          "Fix Leaking Kitchen Sink Pipe",
        description:    "The pipe under my kitchen sink has been leaking for a week. Water is pooling under the cabinet. I need a plumber to diagnose and fix the issue — likely a washer or connector replacement. Please bring all tools and basic parts.",
        category:       "Repair",
        budget:         900,
        estimatedHours: 2,
        address:        "Flat 4B, Jubilee Hills, Hyderabad, Telangana 500033",
        coords:         [78.4070, 17.4316],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      0,
    },
    {
        title:          "Deep Clean 3BHK Apartment Before Move-In",
        description:    "Moving into a previously rented 3BHK. Need thorough deep cleaning including bathrooms, kitchen (inside cabinets + chimney), all rooms, windows, and balcony. Cleaning supplies can be provided on request.",
        category:       "Cleaning",
        budget:         3200,
        estimatedHours: 6,
        address:        "12/A, Indiranagar 100ft Road, Bangalore, Karnataka 560038",
        coords:         [77.6412, 12.9784],
        hasDeadline:    true,
        deadlineDays:   3,
        clientIdx:      1,
    },
    {
        title:          "Birthday Party Photography – 4 Hours",
        description:    "Looking for a photographer for my daughter's 5th birthday at home in Koramangala. Need candid + portrait shots over 4 hours. Edited digital gallery to be delivered within 5 working days.",
        category:       "Photography",
        budget:         5000,
        estimatedHours: 4,
        address:        "45, Koramangala 5th Block, Bangalore, Karnataka 560095",
        coords:         [77.6201, 12.9352],
        hasDeadline:    true,
        deadlineDays:   7,
        clientIdx:      1,
    },
    {
        title:          "Grocery & Pharmacy Pickup and Delivery",
        description:    "Need someone to pick up groceries (~20 items) from DMart Powai and 2 prescription medicines from the nearby pharmacy, then deliver to my flat. Bills paid via UPI — share receipts after each purchase.",
        category:       "Delivery",
        budget:         600,
        estimatedHours: 2,
        address:        "B-14, Andheri West, Mumbai, Maharashtra 400053",
        coords:         [72.8311, 19.1197],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      2,
    },
    {
        title:          "Install 1.5 Ton Split AC",
        description:    "New Voltas 1.5T split AC needs to be installed in the master bedroom. Require a certified AC technician. Bracket, copper pipe, and drain pipe setup required. Please mention if you carry gas charging equipment.",
        category:       "Repair",
        budget:         2200,
        estimatedHours: 3,
        address:        "F-4, Koregaon Park, Pune, Maharashtra 411001",
        coords:         [73.8930, 18.5362],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      0,
    },
    {
        title:          "CBSE Class 10 Math & Science Tutor",
        description:    "My son is in Class 10 CBSE and needs help with Mathematics and Science. Looking for a home tutor available every Saturday and Sunday for 2-hour sessions in Jubilee Hills. At least 2 years tutoring experience required.",
        category:       "Tutoring",
        budget:         1500,
        estimatedHours: 2,
        address:        "H.No. 8-2-293, Road No. 14, Jubilee Hills, Hyderabad, Telangana 500033",
        coords:         [78.4139, 17.4314],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      0,
    },
    {
        title:          "Assemble IKEA Wardrobe & Bed Frame",
        description:    "Purchased IKEA MALM 4-door wardrobe and MALM King bed frame. Need someone with flat-pack furniture assembly experience. All hardware included in the boxes. Worker must bring their own tools. Estimated 3–4 hours.",
        category:       "Delivery",
        budget:         1800,
        estimatedHours: 4,
        address:        "23, HSR Layout Sector 2, Bangalore, Karnataka 560102",
        coords:         [77.6454, 12.9116],
        hasDeadline:    true,
        deadlineDays:   4,
        clientIdx:      1,
    },
    {
        title:          "Paint Master Bedroom (12×14 ft)",
        description:    "Need master bedroom painted — 2 coats of Asian Paints Tractor Emulsion, white. Room is currently empty. Old paint is in good condition with no seepage. Paint and primer will be arranged by me.",
        category:       "Repair",
        budget:         2800,
        estimatedHours: 5,
        address:        "42, Anna Nagar East, Chennai, Tamil Nadu 600040",
        coords:         [80.2108, 13.0859],
        hasDeadline:    true,
        deadlineDays:   6,
        clientIdx:      2,
    },
    {
        title:          "Laptop Not Booting – Diagnose & Fix",
        description:    "My Dell Inspiron 15 suddenly stopped turning on. Tried power cycling multiple times — no luck. Need a technician to diagnose whether it's a motherboard, RAM, or charger issue and fix it on-site if possible.",
        category:       "Repair",
        budget:         2000,
        estimatedHours: 2,
        address:        "1-8-571/B, Begumpet, Hyderabad, Telangana 500016",
        coords:         [78.4666, 17.4448],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      0,
    },
    {
        title:          "Urgent Document Courier – Banjara Hills to Airport",
        description:    "Need urgent delivery of a sealed envelope (signed legal documents) from my office in Banjara Hills to Rajiv Gandhi International Airport. Must reach by 10 AM tomorrow. Extremely time-sensitive.",
        category:       "Delivery",
        budget:         750,
        estimatedHours: 2,
        address:        "Survey No. 74, Gachibowli, Hyderabad, Telangana 500032",
        coords:         [78.3489, 17.4401],
        hasDeadline:    true,
        deadlineDays:   1,
        clientIdx:      0,
    },
    {
        title:          "Backyard Garden Trimming & Cleanup",
        description:    "Small backyard garden (~200 sq ft) with overgrown hedges and several dead plants. Need trimming, removal of dead plants, and general cleanup. Worker must bring their own hedge clippers and basic gardening tools.",
        category:       "Cleaning",
        budget:         1100,
        estimatedHours: 3,
        address:        "17, Aundh, Pune, Maharashtra 411007",
        coords:         [73.8169, 18.5590],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      1,
    },
    {
        title:          "Corporate Event Photography – Half Day",
        description:    "Need an experienced photographer for a corporate product launch event. 4-hour indoor shoot in a professional setting with artificial lighting. Full edited gallery expected within 3 working days. Experience with corporate events is mandatory.",
        category:       "Photography",
        budget:         7000,
        estimatedHours: 4,
        address:        "Tower 3, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
        coords:         [72.8656, 19.0596],
        hasDeadline:    true,
        deadlineDays:   10,
        clientIdx:      2,
    },
    {
        title:          "House Shifting – 2BHK Kukatpally to Miyapur",
        description:    "Shifting a 2BHK flat. Items include: 2 beds with mattresses, 1 sofa set, dining table + 4 chairs, 2 wardrobes, washing machine, fridge, and a TV unit. 3rd floor to ground floor (no lift). Need a mini-truck + 3 labourers.",
        category:       "Moving",
        budget:         5500,
        estimatedHours: 6,
        address:        "Plot 45, Kukatpally, Hyderabad, Telangana 500072",
        coords:         [78.4011, 17.4948],
        hasDeadline:    true,
        deadlineDays:   8,
        clientIdx:      0,
    },
    {
        title:          "English Communication Coaching – 3 Sessions/Week",
        description:    "Looking for a communication coach for spoken English improvement. 1-hour sessions, 3 times per week. Focus on fluency, vocabulary, and professional presentation skills. Corporate background preferred.",
        category:       "Tutoring",
        budget:         1200,
        estimatedHours: 1,
        address:        "15/3, T Nagar, Chennai, Tamil Nadu 600017",
        coords:         [80.2338, 13.0418],
        hasDeadline:    false,
        deadlineDays:   0,
        clientIdx:      2,
    },
    {
        title:          "Wedding Photography – Full Day",
        description:    "Need a wedding photographer for the full daytime ceremony and reception (10 AM – 6 PM). Must have a wedding portfolio. Candid + traditional shots required. Drone shots are a bonus. Full edited gallery delivered within 2 weeks.",
        category:       "Photography",
        budget:         15000,
        estimatedHours: 8,
        address:        "3-6-136/A, Himayatnagar, Hyderabad, Telangana 500029",
        coords:         [78.4776, 17.4063],
        hasDeadline:    true,
        deadlineDays:   14,
        clientIdx:      1,
    },
];

// ─── Conversation message templates per category ──────────────────────────────

type Role = "worker" | "client";
type MsgTpl = { from: Role; text: string };

const CONV_TEMPLATES: Record<string, MsgTpl[]> = {
    Moving: [
        { from: "worker", text: "Hi! I saw your moving task. I have a team of 3 and a mini-truck available. We've done 50+ house shifts in Hyderabad." },
        { from: "client", text: "Great! Can you confirm you can be there before 9 AM? The building gate opens at 9." },
        { from: "worker", text: "Yes, we'll arrive by 8:45 AM. Do you need packing materials or just loading and unloading?" },
        { from: "client", text: "Just loading and unloading — I've already packed everything in boxes and labelled them." },
        { from: "worker", text: "Perfect. We'll bring trolleys and rope for the heavier items. What's the exact address?" },
        { from: "client", text: "Plot 12, Banjara Hills Road No. 1, near Banjara Hotel. Please call when you reach the gate." },
        { from: "worker", text: "Noted. We'll call 10 minutes before arrival. Looking forward to helping with the move!" },
    ],
    Repair: [
        { from: "worker", text: "Hello! I'm a certified technician with 6 years of experience. I can visit tomorrow morning — what time suits you?" },
        { from: "client", text: "Tomorrow 10 AM works for me. How long do you think the repair will take?" },
        { from: "worker", text: "Typically 1–2 hours depending on the fault. I'll bring all tools and basic spare parts." },
        { from: "client", text: "Is your proposed budget inclusive of parts or is that separate?" },
        { from: "worker", text: "Basic parts like washers and connectors are included. Any major parts needed will be charged at cost." },
        { from: "client", text: "That's fair. Come to the address mentioned — I'll leave the main door open for you." },
    ],
    Cleaning: [
        { from: "worker", text: "Hi! I run a professional cleaning team. We regularly do deep cleans for apartments in this area. Happy to take this up." },
        { from: "client", text: "Perfect. Do you bring your own cleaning supplies or should I arrange them?" },
        { from: "worker", text: "We bring all professional-grade supplies and equipment. No need to arrange anything on your end." },
        { from: "client", text: "Excellent! The flat is on the 4th floor with a working lift. Is that okay?" },
        { from: "worker", text: "No problem at all. We'll need access from 9 AM and should be done by 3 PM." },
        { from: "client", text: "I'll be there for the first 30 minutes then step out. I'll leave a spare key with security." },
        { from: "worker", text: "That works perfectly. We'll send you a before/after photo report on WhatsApp once done." },
    ],
    Photography: [
        { from: "worker", text: "Hi! I'm a professional photographer with 5 years of experience. I'd love to cover your event. Can you share venue details?" },
        { from: "client", text: "It's a home event. Around 40 guests, mostly indoor with some outdoor shots in the garden area." },
        { from: "worker", text: "Perfect — I have professional lighting equipment for indoor shoots. Do you need prints or just the digital gallery?" },
        { from: "client", text: "Just the digital gallery is fine. Edited and delivered via Google Drive within 5 days." },
        { from: "worker", text: "That's my standard delivery. I'll also include a short highlight reel as a bonus." },
        { from: "client", text: "That would be wonderful! Please confirm your date availability." },
        { from: "worker", text: "The date is confirmed. I'll arrive 30 minutes early to do a walkthrough of the venue." },
        { from: "client", text: "Amazing. Really looking forward to working with you!" },
    ],
    Delivery: [
        { from: "worker", text: "Hi, I'm available for this delivery. I have a bike and can be at your pickup location within 20 minutes." },
        { from: "client", text: "Great! I'll share the list on WhatsApp. Are you comfortable paying via UPI at the shop?" },
        { from: "worker", text: "Yes, absolutely. I'll pay and send you receipts immediately after each purchase." },
        { from: "client", text: "Perfect. Please go to DMart first, then the pharmacy next door." },
        { from: "worker", text: "Understood. I'll WhatsApp you when I arrive at DMart for a final list confirmation." },
        { from: "client", text: "Good idea. Message me when you start — my number is on this profile." },
    ],
    Tutoring: [
        { from: "worker", text: "Hello! I'm a qualified teacher with 4 years of CBSE home tutoring experience. I'd suggest starting with a free demo session." },
        { from: "client", text: "A demo sounds great. My son struggles with algebra and chemistry in particular." },
        { from: "worker", text: "Understood. I always begin with a diagnostic session to identify gaps before planning the curriculum." },
        { from: "client", text: "That's exactly what we need. Can you come this Saturday at 4 PM?" },
        { from: "worker", text: "Saturday 4 PM works for me. I'll bring worksheets tailored for the demo." },
        { from: "client", text: "Perfect. I'll WhatsApp you the exact address." },
        { from: "worker", text: "Looking forward to meeting your son and getting him on track!" },
    ],
};

const FALLBACK_MSGS: MsgTpl[] = [
    { from: "worker", text: "Hi, I'm interested in this task and available immediately. I have relevant experience and can start right away." },
    { from: "client", text: "Thanks for reaching out. Can you tell me more about your background?" },
    { from: "worker", text: "I have 3+ years of hands-on experience in this type of work. References available on request." },
    { from: "client", text: "That sounds good. What's your expected timeline to complete this?" },
    { from: "worker", text: "I can finish it within the estimated hours listed. When would you like to start?" },
    { from: "client", text: "Let's plan for this weekend. I'll send you the full address." },
];

// ─── Main seed ────────────────────────────────────────────────────────────────

export async function runSeed(): Promise<void> {
    console.log("\n🌱  LocalGig Seed – better-auth + Mongoose");
    console.log("══════════════════════════════════════════════════");
    console.log(`   DB       : ...${MONGODB_URI.slice(-35)}`);
    console.log(`   Auth URL : ${AUTH_BASE}`);
    console.log(`   Wipe     : ${SKIP_WIPE ? "no (--skip-wipe)" : "yes"}`);
    console.log("══════════════════════════════════════════════════\n");

    await mongoose.connect(MONGODB_URI);
    console.log("✅  MongoDB connected\n");

    // ── 1. Wipe ───────────────────────────────────────────────────────────────
    if (!SKIP_WIPE) {
        console.log("🗑   Wiping collections…");
        const nativeDb = mongoose.connection.db!;

        // Wipe better-auth's own collections so fresh signUp succeeds
        for (const col of ["user", "session", "account", "verification"]) {
            try {
                await nativeDb.collection(col).deleteMany({});
            } catch { /* collection might not exist yet */ }
        }

        await Promise.all([
            UserModel.deleteMany({}),
            TaskModel.deleteMany({}),
            ApplicationModel.deleteMany({}),
            SavedTaskModel.deleteMany({}),
            ConversationModel.deleteMany({}),
            MessageModel.deleteMany({}),
        ]);
        console.log("   ✓ All collections cleared\n");
    }

    // ── 2. Create better-auth accounts + Mongoose User docs ──────────────────
    // better-auth stores users in its own `user` collection with a string `id`.
    // Our Mongoose UserModel has a separate ObjectId `_id`.
    // Strategy:
    //   - Call better-auth API → get string authId
    //   - Upsert Mongoose User by email → get ObjectId mongoId
    //   - Use mongoId for ObjectId refs (Task.clientId, Conversation.clientId/workerId)
    //   - Use authId (string) for Application.workerId (schema type: String)

    console.log("👤  Creating auth accounts and user documents…");

    interface SeededUser {
        def:     UserDef;
        authId:  string;                     // better-auth string id
        mongoId: mongoose.Types.ObjectId;    // Mongoose _id
    }

    const seededUsers: SeededUser[] = [];

    for (const def of USER_DEFS) {
        // 2a. better-auth signup
        let authId = await signUpViaApi(def.name, def.email, def.password);

        if (authId === "EXISTS") {
            // Retrieve the existing id from better-auth's `user` collection
            const nativeDb = mongoose.connection.db!;
            const found = await nativeDb.collection("user").findOne({ email: def.email });
            if (!found) throw new Error(`${def.email} exists in auth but not found in DB — clear and retry.`);
            authId = (found.id ?? found._id).toString();
            console.log(`   ⚠  ${def.email} already in auth → authId: ${authId}`);
        } else {
            console.log(`   ✓ ${def.email} → authId: ${authId}`);
        }

        // 2b. Upsert Mongoose User (keyed by email)
        const userDoc = await UserModel.findOneAndUpdate(
            { email: def.email },
            {
                $set: {
                    authId: authId,
                    name:   def.name,
                    email:  def.email,
                    role:   def.role,
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(def.name)}&backgroundColor=3b82f6&textColor=ffffff`,
                    bio:    def.bio,
                    phone:  def.phone,
                    settings: {
                        notifications: {
                            email:              true,
                            push:               true,
                            applicationUpdates: true,
                            newMessages:        true,
                            taskUpdates:        true,
                        },
                        preferences: {
                            darkMode: false,
                            language: "en",
                            currency: "INR",
                        },
                        privacy: {
                            showEmail: false,
                            showPhone: false,
                        },
                    },
                },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        seededUsers.push({ def, authId, mongoId: userDoc._id as mongoose.Types.ObjectId });
        console.log(`   ✓ Mongoose user for ${def.email} → _id: ${userDoc._id}`);
    }
    console.log();

    // ── 3. Tasks ──────────────────────────────────────────────────────────────
    console.log("📋  Seeding tasks…");

    const taskDocs = await TaskModel.insertMany(
        TASK_BLUEPRINTS.map((bp) => {
            const client = seededUsers[bp.clientIdx];
            return {
                title:          bp.title,
                description:    bp.description,
                budget:         bp.budget,
                category:       bp.category,
                estimatedHours: bp.estimatedHours,
                address:        bp.address,
                location:       { type: "Point", coordinates: bp.coords },
                deadline:       bp.hasDeadline ? daysFromNow(bp.deadlineDays) : undefined,
                status:         "open" as const,
                clientId:       client.mongoId,
                applicantsCount: 0,
            };
        })
    );

    console.log(`   ✓ ${taskDocs.length} tasks inserted\n`);

    // ── 4. Applications ───────────────────────────────────────────────────────
    console.log("📨  Seeding applications…");

    // Per task: workers = all users EXCEPT the task's creator.
    // With 3 users, each task has exactly 2 eligible workers.
    // Pattern per task (cycling through 16 tasks):
    //   tIdx % 3 === 0 → first worker accepted, second pending
    //   tIdx % 3 === 1 → first worker pending, second rejected
    //   tIdx % 3 === 2 → both pending

    interface AppInsert {
        taskId:         mongoose.Types.ObjectId;
        workerId:       string;          // authId string — matches schema
        message:        string;
        proposedBudget: number;
        status:         "pending" | "accepted" | "rejected";
        createdAt:      Date;
        updatedAt:      Date;
    }

    interface AcceptedEntry {
        task:       (typeof taskDocs)[0];
        bp:         TaskBlueprint;
        worker:     SeededUser;
        client:     SeededUser;
    }

    const appInserts:    AppInsert[]    = [];
    const appliedSet     = new Set<string>(); // "taskId::workerId"
    const acceptedList:  AcceptedEntry[] = [];

    for (let tIdx = 0; tIdx < taskDocs.length; tIdx++) {
        const task    = taskDocs[tIdx];
        const bp      = TASK_BLUEPRINTS[tIdx];
        const client  = seededUsers[bp.clientIdx];
        const workers = seededUsers.filter((u) => u.authId !== client.authId);

        const pattern = tIdx % 3; // 0 = accept first, 1 = reject second, 2 = all pending

        for (let wIdx = 0; wIdx < workers.length; wIdx++) {
            const worker = workers[wIdx];
            const key    = `${task._id}::${worker.authId}`;
            if (appliedSet.has(key)) continue;
            appliedSet.add(key);

            let status: "pending" | "accepted" | "rejected";
            if (pattern === 0 && wIdx === 0) status = "accepted";
            else if (pattern === 1 && wIdx === 1) status = "rejected";
            else status = "pending";

            const budget = Math.round(bp.budget * (0.88 + wIdx * 0.08));

            appInserts.push({
                taskId:         task._id as mongoose.Types.ObjectId,
                workerId:       worker.authId,
                message:        `Hi! I'm experienced in ${bp.category} tasks and can start immediately. My proposed rate for this job is ₹${budget.toLocaleString("en-IN")}. I ensure quality work within the estimated time.`,
                proposedBudget: budget,
                status,
                createdAt:      daysAgo(3 - wIdx),
                updatedAt:      daysAgo(3 - wIdx),
            });

            if (status === "accepted") {
                acceptedList.push({ task, bp, worker, client });
            }
        }
    }

    await ApplicationModel.insertMany(appInserts);
    console.log(`   ✓ ${appInserts.length} applications inserted`);
    console.log(`   ✓ ${acceptedList.length} accepted applications\n`);

    // ── 5. Update accepted tasks ──────────────────────────────────────────────
    console.log("🔄  Updating task statuses and applicant counts…");

    await Promise.all(
        acceptedList.map(({ task, worker }) =>
            TaskModel.findByIdAndUpdate(task._id, {
                status:           "in_progress",
                assignedWorkerId: worker.mongoId,
            })
        )
    );

    // Recalculate applicantsCount per task
    const countMap = new Map<string, number>();
    for (const a of appInserts) {
        const k = a.taskId.toString();
        countMap.set(k, (countMap.get(k) ?? 0) + 1);
    }
    await Promise.all(
        taskDocs.map((t) =>
            TaskModel.findByIdAndUpdate(t._id, { applicantsCount: countMap.get(t._id.toString()) ?? 0 })
        )
    );

    console.log("   ✓ Done\n");

    // ── 6. Saved tasks ────────────────────────────────────────────────────────
    console.log("🔖  Seeding saved tasks…");

    const savedInserts: Array<{ userId: mongoose.Types.ObjectId; taskId: mongoose.Types.ObjectId }> = [];
    const savedSet = new Set<string>();

    for (const user of seededUsers) {
        // Tasks NOT created by this user
        const eligible = taskDocs.filter(
            (_, idx) => seededUsers[TASK_BLUEPRINTS[idx].clientIdx].authId !== user.authId
        );
        const toSave = pickN(eligible, 3 + Math.floor(Math.random() * 4));

        for (const task of toSave) {
            const k = `${user.mongoId}::${task._id}`;
            if (savedSet.has(k)) continue;
            savedSet.add(k);
            savedInserts.push({
                userId: user.mongoId,
                taskId: task._id as mongoose.Types.ObjectId,
            });
        }
    }

    await SavedTaskModel.insertMany(savedInserts);
    console.log(`   ✓ ${savedInserts.length} saved tasks inserted\n`);

    // ── 7. Conversations + Messages ───────────────────────────────────────────
    console.log("💬  Seeding conversations and messages…");

    let totalConvs = 0;
    let totalMsgs  = 0;

    for (const { task, bp, worker, client } of acceptedList) {
        // Create conversation (clientId/workerId are ObjectIds)
        const conv = await ConversationModel.create({
            taskId:   task._id,
            clientId: client.mongoId,
            workerId: worker.mongoId,
        });
        totalConvs++;

        const templates = CONV_TEMPLATES[bp.category] ?? FALLBACK_MSGS;
        const msgCount  = Math.min(templates.length, 5 + Math.floor(Math.random() * 3));

        const messages: Array<{
            conversationId: mongoose.Types.ObjectId;
            taskId:         mongoose.Types.ObjectId;
            senderId:       mongoose.Types.ObjectId;
            receiverId:     mongoose.Types.ObjectId;
            content:        string;
            status:         "sent" | "delivered" | "read";
            createdAt:      Date;
            updatedAt:      Date;
        }> = [];

        let msgTime = daysAgo(2);

        for (let m = 0; m < msgCount; m++) {
            const tpl         = templates[m];
            const isWorker    = tpl.from === "worker";
            const senderMongo = isWorker ? worker.mongoId : client.mongoId;
            const recvrMongo  = isWorker ? client.mongoId : worker.mongoId;

            // Advance time naturally
            msgTime = minutesAfter(msgTime, 5 + Math.floor(Math.random() * 20));

            // Last 1–2 messages are unread/delivered, rest are read
            const status: "sent" | "delivered" | "read" =
                m < msgCount - 2 ? "read" : m === msgCount - 1 ? "delivered" : "read";

            messages.push({
                conversationId: conv._id as mongoose.Types.ObjectId,
                taskId:         task._id as mongoose.Types.ObjectId,
                senderId:       senderMongo,
                receiverId:     recvrMongo,
                content:        tpl.text,
                status,
                createdAt:      msgTime,
                updatedAt:      msgTime,
            });
        }

        await MessageModel.insertMany(messages);

        const last   = messages[messages.length - 1];
        const unread = messages.filter((m) => m.status !== "read").length;

        await ConversationModel.findByIdAndUpdate(conv._id, {
            lastMessage:   last.content.slice(0, 100),
            lastMessageAt: last.createdAt,
            unreadCount:   unread,
        });

        totalMsgs += messages.length;
    }

    console.log(`   ✓ ${totalConvs} conversations inserted`);
    console.log(`   ✓ ${totalMsgs} messages inserted\n`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("══════════════════════════════════════════════════");
    console.log("🎉  Seed complete!\n");
    console.log(`   Users           : ${seededUsers.length}`);
    console.log(`   Tasks           : ${taskDocs.length}`);
    console.log(`   Applications    : ${appInserts.length}`);
    console.log(`     ↳ accepted    : ${acceptedList.length}`);
    console.log(`   Saved tasks     : ${savedInserts.length}`);
    console.log(`   Conversations   : ${totalConvs}`);
    console.log(`   Messages        : ${totalMsgs}`);
    console.log("\n   ─── Login credentials ───────────────────────");
    for (const def of USER_DEFS) {
        console.log(`   ${def.email.padEnd(28)} / Password@123`);
    }
    console.log("══════════════════════════════════════════════════\n");
}

// ─── CLI runner ───────────────────────────────────────────────────────────────

runSeed()
    .then(()  => process.exit(0))
    .catch((err) => {
        console.error("\n❌  Seed failed:", (err as Error).message);
        console.error((err as Error).stack);
        process.exit(1);
    });