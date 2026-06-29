import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://vhuyidswycrthwpsjpcx.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodXlpZHN3eWNydGh3cHNqcGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDYwNzksImV4cCI6MjA5MzMyMjA3OX0.IN4QBDrVfsLArgevzYKZiP83NoQhxghWGM7W002WPrg"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)