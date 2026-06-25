from app.services.ai_processor import AIProcessor
import sys

try:
    print("Attempting to initialize AI Engine...")
    processor = AIProcessor()
    print("AI Engine initialized successfully!")
    print(f"Model Directory: {processor.AI_MODEL_DIR}")
except Exception as e:
    print(f"FAILED to initialize AI Engine: {str(e)}")
    sys.exit(1)
