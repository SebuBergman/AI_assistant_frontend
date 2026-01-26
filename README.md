# Frontend – AI Assistant Interface

## 📌 Overview
This is the UI for the AI Assistant platform — inspired by modern chat-based AI apps (ChatGPT, Claude, etc.).

Users can:
- Chat with AI across **13 models**
- View model tooltips with pricing & ideal use case info
- Adjust temperature
- Switch between **dark/light mode**
- Enable **Temporary Chat** (doesn’t save to Redis)
- Enable/disable **RAG**
- Upload documents & delete all documents from RAG
- Pick embedded PDFs for hybrid search queries
- Use keyword search (optional) + prompt
- Manage sidebar chat history (auto-generated titles)
- Shows RAG context and references used to generate a response
- Shows token counts (input, output and total) for each prompt

---

## 🧠 Tech Stack
- **Next.js**
- **TypeScript**
- **MUI Material UI**
- **Axios**
- **ioredis**
- **pg**
- **react-router-dom**
- **react-markdown**
- **streamdown**
- **uuid**
- **remark-gfm**
- **rehype-highlight**

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```

Open your browser at:  
👉 **http://localhost:3000**

---

## 🔧 Editing
You can begin editing the UI by modifying:

```
app/page.tsx
```

The page auto-reloads when files are saved.

---

## ⚠️ Known Bug (IMPORTANT)

---

## 🔐 Environment Variables

1. Create `.env` in the project root  
2. Copy all keys from `.env-template`  
3. Replace `<placeholder>` values with real credentials  

Example:

```
# Supabase db
DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?sslmode=require

# Redis
REDIS_HOST=<public-endpoint (without the :port-number on the end)>
REDIS_PORT=<redis-port>
REDIS_PASSWORD=<redis-user-password>

# Python Backend
PY_BACKEND_URL=<backend-url>
```

---

## 🧩 Supabase Schema

### Below is the schema used by the frontend for storing chats & messages.

### Chats Table
```sql
create table public.chats (
  id uuid not null default gen_random_uuid(),
  user_id character varying(255) not null,
  title character varying(500) not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint chats_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_user_chats 
on public.chats using btree (user_id, updated_at desc) 
TABLESPACE pg_default;
```

### Messages Table
```sql
create table public.messages (
  id uuid not null default gen_random_uuid(),
  chat_id uuid not null,
  role character varying(50) not null,
  content text not null,
  rag_references jsonb null,
  token_counts jsonb null,
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_chat_id_fkey 
    foreign KEY (chat_id) references chats (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_chat_messages 
on public.messages using btree (chat_id, created_at) 
TABLESPACE pg_default;

alter table public.messages
add constraint messages_role_check
check (role in ('user', 'assistant'));

create index if not exists idx_messages_rag_references
on public.messages
using gin (rag_references)
where rag_references is not null;

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_chats_updated_at
before update on public.chats
for each row
execute function update_updated_at_column();
```

### What these schemas support
- Auto-generated chat titles
- Fast retrieval by user + updated timestamp
- Fast message loading per chat
- Automatic cleanup (messages deleted if chat is deleted)

---

## 📄 Features Summary
### Chat UI / Model Tools
- Agent-like interface  
- Supports 13 AI models  
- Tooltip with model pricing + ideal usage  
- Temperature slider  
- Light/Dark theme toggle  

### RAG
- Enable/disable hybrid RAG  
- Upload PDFs  
- Delete all PDFs  
- Pick a document  
- Query with keyword + prompt  

### Sidebar Chat History
- Saved in Redis  
- Auto-generated conversation titles  
- Temporary chat mode disables saving  

---

## 📝 TODO
Model router + "best model" suggestion?
RAG quality controls
- Top-K chunks, chunk size preview, similarity threshold
- Hybrid weighting slider
- "Require citations" toggle (answer must cite sources or say "not found")
- "Only use my docs" mode (no general knowledge / no web)
- Cost estimation
---

## 🔗 Backend Link
👉 **View the Backend README here:**  

[`https://github.com/your-username/backend-repo`](https://github.com/SebuBergman/AI_assistant_backend)

