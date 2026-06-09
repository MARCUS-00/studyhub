import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  for (const c of [
    {
      college_code: "305",
      college_name: "dsit",
      address: "bangalore",
      college_mail: "dsit@gmail.com",
      college_website: "dsit.com",
    },
    {
      college_code: "365",
      college_name: "svp",
      address: "bangalore",
      college_mail: "svp@gmail.com",
      college_website: "svp.com",
    },
    {
      college_code: "465",
      college_name: "ksp",
      address: "bangalore",
      college_mail: "ksit@gmail.com",
      college_website: "ksit.com",
    },
  ]) {
    await prisma.college.upsert({
      where: { college_code: c.college_code },
      update: {},
      create: c,
    });
  }
  console.log("✓ Colleges");

  for (const b of ["CSE", "EC", "ME", "CE", "AE"]) {
    await prisma.branch.upsert({
      where: { branch_name: b },
      update: {},
      create: { branch_name: b },
    });
  }
  console.log("✓ Branches");

  for (const s of ["1", "2", "3", "4", "5", "6"]) {
    await prisma.semesters.upsert({
      where: { sem_no: s },
      update: {},
      create: { sem_no: s },
    });
  }
  console.log("✓ Semesters");

  for (const s of [
    { sub_code: "20CS21P", sub_name: "Operating systems", sem_no: "4" },
    { sub_code: "20CS22P", sub_name: "Operating systems", sem_no: "4" },
    { sub_code: "20CS24P", sub_name: "Hardware", sem_no: "4" },
    { sub_code: "20CS23P", sub_name: "Software engineering", sem_no: "4" },
  ]) {
    await prisma.subjects.upsert({
      where: { sub_code: s.sub_code },
      update: {},
      create: s,
    });
  }
  console.log("✓ Subjects");

  const staffPw = await hash("staff123", 10);
  const studentPw = await hash("student123", 10);
  const manojPw = await hash("manoj123", 10);

  for (const u of [
    {
      first_name: "SHIVA HIREMATH",
      last_name: "V",
      mail_id: "shiva@gmail.com",
      password: staffPw,
      address: "bangalore",
      prof_image: "",
      sem_no: "6",
      role: "STAFF" as const,
      college_code: "305",
      branch_name: "CSE",
      email_verified: true,
    },
    {
      first_name: "deepak",
      last_name: "s",
      mail_id: "deepak@gmail.com",
      password: staffPw,
      address: "bangalore",
      prof_image: "",
      sem_no: "6",
      role: "STAFF" as const,
      college_code: "305",
      branch_name: "CSE",
      email_verified: true,
    },
    {
      first_name: "MANOJ KUMAR",
      last_name: "G",
      mail_id: "manojkumar@gmail.com",
      password: manojPw,
      address: "bangalore",
      prof_image: "",
      sem_no: "6",
      role: "STUDENT" as const,
      college_code: "305",
      branch_name: "CSE",
      email_verified: true,
    },
    {
      first_name: "Demo",
      last_name: "Staff",
      mail_id: "staff@studyhub.com",
      password: staffPw,
      address: "bangalore",
      prof_image: "",
      sem_no: "6",
      role: "STAFF" as const,
      college_code: "305",
      branch_name: "CSE",
      email_verified: true,
    },
    {
      first_name: "Demo",
      last_name: "Student",
      mail_id: "student@studyhub.com",
      password: studentPw,
      address: "bangalore",
      prof_image: "",
      sem_no: "6",
      role: "STUDENT" as const,
      college_code: "305",
      branch_name: "CSE",
      email_verified: true,
    },
  ] as any[]) {
    await prisma.user.upsert({
      where: { mail_id: u.mail_id },
      update: {
        first_name: u.first_name,
        last_name: u.last_name,
        password: u.password,
        address: u.address,
        prof_image: u.prof_image,
        sem_no: u.sem_no,
        role: u.role,
        college_code: u.college_code,
        branch_name: u.branch_name,
        email_verified: u.email_verified,
      },
      create: u,
    });
  }
  console.log("✓ Users");

  const shiva = await prisma.user.findUnique({
    where: { mail_id: "shiva@gmail.com" },
  });
  if (!shiva) throw new Error("Staff user not found");

  const t1 = await prisma.tests.upsert({
    where: { id: "2963742f-efe6-4fa3-bd32-4b3f6b3ab336" },
    update: {},
    create: {
      id: "2963742f-efe6-4fa3-bd32-4b3f6b3ab336",
      test_title: "Web Development",
      subjectsSub_code: "20CS23P",
      userId: shiva.id,
    },
  });
  for (const q of [
    {
      id: "f8d5a13b-7178-4cd6-8d2f-3b3ecf854ef7",
      question: "What is the language used for styling?",
      choices: ["HTML", "CSS", "Java Script", "Go"],
      answer: "CSS",
    },
    {
      id: "f87111f2-751b-4b4e-acf9-38e6a02cf9f1",
      question: "Property for changing text color in CSS?",
      choices: ["color", "text-color", "font-color", "style-color"],
      answer: "color",
    },
    {
      id: "34bee02d-b74a-4161-9ad6-b0407821977d",
      question: "How many positions are in CSS?",
      choices: ["3", "4", "6", "5"],
      answer: "5",
    },
    {
      id: "24f23ad7-0706-47fa-a66b-2437f5ce400c",
      question: "Which language is a server scripting language?",
      choices: ["Node JS", "HTML", "CSS", "Next JS"],
      answer: "Node JS",
    },
    {
      id: "5635aa24-4815-403d-a428-02a53752b505",
      question: "Which tag takes user input in HTML?",
      choices: ["<input/>", "<div/>", "<html/>", "<body/>"],
      answer: "<input/>",
    },
    {
      id: "d9c0d662-4fe0-4ed0-88cb-8f7187008fb2",
      question: "How many normalizations in Database Design?",
      choices: ["3", "8", "9", "6"],
      answer: "6",
    },
    {
      id: "12fe3336-e5a6-413b-9591-c0d81c777ed2",
      question: "Correct syntax to create a table in MySQL?",
      choices: [
        "column_name data_type,",
        "CREATE TABLE (column_name data_type)",
      ],
      answer: "CREATE TABLE (column_name data_type)",
    },
  ]) {
    await prisma.questions.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, testsId: t1.id },
    });
  }
  console.log("✓ Test 1: Web Development (7 questions)");

  const t2 = await prisma.tests.upsert({
    where: { id: "7ca71616-8d55-4d20-b68e-e8fe4cc4214c" },
    update: {},
    create: {
      id: "7ca71616-8d55-4d20-b68e-e8fe4cc4214c",
      test_title: "Network Security",
      subjectsSub_code: "20CS23P",
      userId: shiva.id,
    },
  });
  for (const q of [
    {
      id: "2f15711c-93af-463e-9dee-1b002e0d86f8",
      question: "Network security is related to?",
      choices: ["Hardware and software", "Tools", "Papers", "Home"],
      answer: "Hardware and software",
    },
    {
      id: "40f9ae3d-c25d-439a-9b21-3b8b9a389dc4",
      question: "API structure is called as?",
      choices: [
        "two tier structure",
        "Three tier structure",
        "1 tier structure",
      ],
      answer: "Three tier structure",
    },
    {
      id: "b1ee3a98-7ee0-464c-a776-a98d29a4a050",
      question: "Public key is also known as?",
      choices: ["Private Key", "Secrete key", "Role Key", "Anon Key"],
      answer: "Anon Key",
    },
    {
      id: "414eb9a7-becf-4184-bf8b-f718b3a71c85",
      question: "How many cipher algorithms are there?",
      choices: ["1", "4", "8", "10"],
      answer: "4",
    },
  ]) {
    await prisma.questions.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, testsId: t2.id },
    });
  }
  console.log("✓ Test 2: Network Security (4 questions)");

  const t3 = await prisma.tests.upsert({
    where: { id: "8b9cec28-88d9-4218-8a74-341cda06bc99" },
    update: {},
    create: {
      id: "8b9cec28-88d9-4218-8a74-341cda06bc99",
      test_title: "Software Engineering",
      subjectsSub_code: "20CS23P",
      userId: shiva.id,
    },
  });
  for (const q of [
    {
      id: "0e10fd01-16e4-4fe0-81c9-70dcd15896dd",
      question: "First mostly used model?",
      choices: ["waterfall modal", "Rain Modal", "Agile Modal", "Regex Modal"],
      answer: "waterfall modal",
    },
    {
      id: "d19c5104-d5d9-4d88-a53c-52ede6428de6",
      question: "Most flexible model?",
      choices: ["Agile", "Water fall", "Regex Modal", "fiester modal"],
      answer: "Agile",
    },
    {
      id: "17ea4f15-c3f7-4ae6-ac0c-6fa26745a5cd",
      question: "How many types of testing?",
      choices: ["8", "10", "3", "4"],
      answer: "8",
    },
    {
      id: "6d578ca1-64c4-4a55-a198-d5aa00438a55",
      question: "Best way to check code quality?",
      choices: [
        "By seeing code",
        "By running code",
        "By deploying code",
        "By debugging code",
      ],
      answer: "By debugging code",
    },
  ]) {
    await prisma.questions.upsert({
      where: { id: q.id },
      update: {},
      create: { ...q, testsId: t3.id },
    });
  }
  console.log("✓ Test 3: Software Engineering (4 questions)");

  console.log("\n🎉 Done!\n");
  console.log("STAFF:   shiva@gmail.com      / staff123");
  console.log("STAFF:   staff@studyhub.com   / staff123");
  console.log("STUDENT: manojkumar@gmail.com / manoj123");
  console.log("STUDENT: student@studyhub.com / student123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
