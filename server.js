require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializa o cliente do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Rota base para verificar se a API está online na Vercel
app.get('/', (req, res) => {
  res.json({ message: 'API rodando na Vercel com Supabase!' });
});

// CREATE - Criar nova tarefa
app.post('/tasks', async (req, res) => {
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'O título é obrigatório.' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ title, description }])
    .select();
  
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
});

// READ - Listar todas as tarefas
app.get('/tasks', async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// READ - Obter uma tarefa específica
app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.status(200).json(data);
});

// UPDATE - Atualizar uma tarefa
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  
  const { data, error } = await supabase
    .from('tasks')
    .update({ title, description, completed })
    .eq('id', id)
    .select();
    
  if (error) return res.status(400).json({ error: error.message });
  if (data.length === 0) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  
  res.status(200).json(data[0]);
});

// DELETE - Excluir uma tarefa
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Tarefa deletada com sucesso.' });
});

// Inicialização do servidor para ambiente local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando localmente na porta ${PORT}`);
  });
}

// Exporta o app para o ambiente Serverless da Vercel
module.exports = app;
