from openai import OpenAI
import json
import os
from typing import List, Dict

# In a real app, use environment variables for keys
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    # We'll allow initialization for now but it will fail on call if still missing
    # In production, this should be handled more strictly
    print("WARNING: OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=api_key)

def extract_concepts(transcript_text: str) -> List[Dict]:
    """
    Uses an LLM to identify key concepts and their relationships from the transcript.
    Returns a list of concept objects with names and relative importance.
    """
    
    prompt = f"""
    Analyze the following lecture transcript and extract key technical concepts.
    For each concept, provide:
    1. The name of the concept.
    2. A brief 1-sentence definition.
    3. A list of "related concepts" mentioned in this context.

    Transcript:
    \"\"\"{transcript_text}\"\"\"

    Output format: JSON list of objects like:
    [
      {{
        "name": "Concept Name",
        "definition": "Brief definition",
        "related": ["Related Concept 1", "Related Concept 2"]
      }}
    ]
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        # Note: GPT-4o json_object output usually needs to be keyed
        result = json.loads(response.choices[0].message.content)
        # If the LLM returns {"concepts": [...]}, handle that
        if "concepts" in result:
            return result["concepts"]
        return result if isinstance(result, list) else [result]
        
    except Exception as e:
        print(f"Error during extraction: {e}")
        return []

if __name__ == "__main__":
    # Test stub
    test_text = "Today we are talking about Recursion. Recursion is when a function calls itself. It is often used in Merge Sort."
    concepts = extract_concepts(test_text)
    print(json.dumps(concepts, indent=2))
