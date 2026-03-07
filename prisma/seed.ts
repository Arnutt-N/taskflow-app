const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database with testing data...');

    // Clear existing for testing
    await prisma.activityLog.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.project.deleteMany({});
    
    // Create base user if none exists
    let user = await prisma.user.findFirst();
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test Administrator',
                role: 'ADMIN',
                password: 'hash' // mock
            }
        });
    }

    // Prepare projects data matching full-options visual needs
    const now = new Date();
    
    // 1. High-value project close to deadline
    const deadline1 = new Date(); deadline1.setDate(now.getDate() + 2);
    
    // 2. Planning project 
    const deadline2 = new Date(); deadline2.setDate(now.getDate() + 30);
    
    // 3. Late Project in Review
    const deadline3 = new Date(); deadline3.setDate(now.getDate() - 5);

    // 4. Completed Project
    const deadline4 = new Date(); deadline4.setDate(now.getDate() - 15);
    
    // 5. Normal In Progress
    const deadline5 = new Date(); deadline5.setDate(now.getDate() + 14);

    const projectsData = [
        {
            name: 'Alpha Redesign Initiative',
            team: 'Design Squad',
            status: 'TODO',
            deadline: deadline1,
            progress: 15,
            budget: 50000,
            revenue: 120000,
            margin: 58.3
        },
        {
            name: 'New Backend Architecture',
            team: 'Core Engine',
            status: 'PLANNING', // if this fails, use default 'TODO' or map to 'IN_PROGRESS' if enum issues
            deadline: deadline2,
            progress: 5,
            budget: 80000,
            revenue: 95000,
            margin: 15.8
        },
        {
            name: 'Mobile App Marketing',
            team: 'Growth',
            status: 'REVIEW',
            deadline: deadline3,
            progress: 95,
            budget: 15000,
            revenue: 45000,
            margin: 66.7
        },
        {
            name: 'Q1 Security Audit',
            team: 'SecOps',
            status: 'DONE',
            deadline: deadline4,
            progress: 100,
            budget: 12000,
            revenue: 15000,
            margin: 20.0
        },
        {
            name: 'Legacy Code Server Migration',
            team: 'Core Engine',
            status: 'IN_PROGRESS',
            deadline: deadline5,
            progress: 60,
            budget: 45000,
            revenue: 55000,
            margin: 18.2
        }
    ];

    for (const pData of projectsData) {
        // Safe mapping to project status
        let mapStatus = 'TODO';
        if (pData.status === 'IN_PROGRESS') mapStatus = 'IN_PROGRESS';
        else if (pData.status === 'REVIEW') mapStatus = 'REVIEW';
        else if (pData.status === 'DONE') mapStatus = 'DONE';
        
        await prisma.project.create({
            data: {
                name: pData.name,
                team: pData.team,
                status: mapStatus,
                deadline: pData.deadline,
                progress: pData.progress,
                budget: pData.budget,
                revenue: pData.revenue,
                margin: pData.margin,
                description: 'Seed project description',
                tasks: {
                    create: [
                        { title: 'Task 1 for ' + pData.name, status: 'TODO' },
                        { title: 'Task 2 for ' + pData.name, status: 'IN_PROGRESS' }
                    ]
                }
            }
        });
    }

    console.log('Seeding complete! Added 5 projects with varied states.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
