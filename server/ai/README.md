# AI Service Configuration

This project has been configured to use local LLM models instead of OpenAI's API. This allows you to train and use custom models with LLaMA Factory + QLoRA for each Hatch's thinking style.

## Local LLM Setup Options

### Option 1: LM Studio (Recommended for Development)
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Download a compatible model (e.g., Llama 2, Mistral, etc.)
3. Start the local server in LM Studio (usually runs on `http://localhost:1234`)
4. Set environment variables:
   ```bash
   LOCAL_LLM_ENDPOINT=http://localhost:1234/v1/chat/completions
   LOCAL_LLM_MODEL=your-model-name
   ```

### Option 2: Text Generation WebUI (oobabooga)
1. Install [Text Generation WebUI](https://github.com/oobabooga/text-generation-webui)
2. Load your model and enable API mode
3. Set environment variables:
   ```bash
   LOCAL_LLM_ENDPOINT=http://localhost:5000/v1/chat/completions
   LOCAL_LLM_MODEL=your-model-name
   ```

### Option 3: Custom LLaMA Factory + QLoRA Models
After training your models with LLaMA Factory:

1. Export trained models to .gguf format
2. Use LM Studio or similar to serve the models
3. Configure different endpoints for different agent roles:
   ```bash
   # Product Manager model
   PM_MODEL_ENDPOINT=http://localhost:1234/v1/chat/completions
   PM_MODEL_NAME=hatch-pm-model
   
   # Designer model  
   DESIGNER_MODEL_ENDPOINT=http://localhost:1235/v1/chat/completions
   DESIGNER_MODEL_NAME=hatch-designer-model
   ```

## Environment Variables

Create a `.env` file in the project root with:

```bash
# Local LLM Configuration
LOCAL_LLM_ENDPOINT=http://localhost:1234/v1/chat/completions
LOCAL_LLM_MODEL=llama-2-7b-chat
LOCAL_LLM_API_KEY=not-needed

# Optional: Role-specific models
PRODUCT_MANAGER_MODEL=hatch-pm-model
DESIGNER_MODEL=hatch-designer-model
DEVELOPER_MODEL=hatch-dev-model
```

## Fallback Behavior

If no local LLM is available, the system will use rule-based responses that:
- Analyze the user message for keywords
- Generate contextually appropriate responses based on the agent's role
- Maintain conversation flow while the LLM service is unavailable

## Training Your Models

### Step 1: Prepare Training Data
1. Collect conversation examples for each role
2. Format data according to LLaMA Factory requirements
3. Include role-specific knowledge and personality traits

### Step 2: Train with QLoRA
```bash
# Example training command (adjust paths and parameters)
python src/train_bash.py \
    --stage sft \
    --model_name_or_path meta-llama/Llama-2-7b-hf \
    --dataset your_training_data \
    --template llama2 \
    --finetuning_type lora \
    --output_dir ./saves/llama2-7b/lora/sft \
    --per_device_train_batch_size 2 \
    --gradient_accumulation_steps 4 \
    --lr_scheduler_type cosine \
    --logging_steps 10 \
    --save_steps 1000 \
    --learning_rate 5e-5 \
    --num_train_epochs 3.0
```

### Step 3: Export and Deploy
```bash
# Export to GGUF format
python src/export_model.py \
    --model_name_or_path meta-llama/Llama-2-7b-hf \
    --adapter_name_or_path ./saves/llama2-7b/lora/sft \
    --template llama2 \
    --finetuning_type lora \
    --export_dir ./exports \
    --export_size 2 \
    --export_legacy_format False
```

## Testing Your Setup

The system will automatically fall back to rule-based responses if the local LLM is not available. To test:

1. Start your local LLM server
2. Run the application
3. Try chatting with different AI agents
4. Check the console logs for connection status

## Model Requirements

- **Memory**: At least 8GB RAM for 7B models, 16GB+ for larger models
- **Storage**: 4-13GB per model depending on size
- **Performance**: Better performance with GPU acceleration

## Troubleshooting

- **Connection refused**: Check if your local LLM server is running
- **Model not found**: Verify the model name matches what's loaded in your LLM server
- **Slow responses**: Consider using smaller models or enabling GPU acceleration
- **Out of memory**: Reduce batch size or use quantized models