# StudyHub
this platform designed to enhance students' academic performance by providing easy access to study materials, allowing them to take tests, view results, like and dislike notes, and access a wide range of educational resources.

## Features:

- Test Taking: Students can take tests on various subjects, allowing them to assess their knowledge and track their performance over time.
- Test Results: Students can view their test results and analyze their strengths and weaknesses to focus on areas that require improvement.
- Note Rating: Students can rate and provide feedback on study materials, helping others identify high-quality resources.
- Note Access: Students can view and download notes uploaded by staff members, providing them with valuable reference materials.
- Staff Upload: Staff members can easily upload notes, question papers, and other educational resources, ensuring a continuous flow of updated materials.


## Prerequisites

Before running the project, make sure you have the following installed on your machine:

- Node.js (version 14 or later)

## Installation

### Follow these steps to set up and run the project:

### Install the dependencies.

```shell
npm i
```


## Configuration

In order to run the project, you need to configure the following:

### Prisma

1. Create a new file called `.env` in the root directory of the project.

2. Add the following environment variables to the `.env` file:

```shell
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```

Replace `user`, `password`, and `database` with your own PostgreSQL credentials.

### Supabase

1. Go to the Supabase website (https://supabase.io) and sign up for an account if you haven't already.

2. Create a new project and obtain your Supabase URL and Supabase anon Key.

3. Open the `.env` file and add the following environment variables:

```shell
SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-anon-key"
```

Replace `your-supabase-url` and `your-supabase-anon-key` with your own Supabase credentials.

## Usage

To start the development server, run the following command:

```shell
npm run dev
```

The application will be accessible at `http://localhost:3000`.

