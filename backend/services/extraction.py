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

def extract_concepts(segments: List[Dict]) -> List[Dict]:
    """
    Uses an LLM to identify key concepts from transcript segments.
    Returns concepts mapped to the timestamp where they were first discussed.
    """
    # Combine first 10 mins of transcript for overview extraction
    # (In a larger app, we might do this in chunks)
    full_text = " ".join([s['text'] for s in segments])
    
    prompt = f"""
    Analyze the following lecture transcript and extract the most important technical concepts.
    For each concept, provide:
    1. The name of the concept.
    2. A brief 1-sentence definition.
    3. The EXACT phrase from the transcript that introduces this concept.

    Transcript:
    \"\"\"{full_text[:6000]}\"\"\" 

    Output format: JSON object with a "concepts" key:
    {{
      "concepts": [
        {{
          "name": "Concept Name",
          "definition": "Brief definition",
          "phrase": "exact introducing phrase"
        }}
      ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        raw_result = json.loads(response.choices[0].message.content)
        extracted_concepts = raw_result.get("concepts", [])

        import re
        def clean_text(t):
            return re.sub(r'[^\w\s]', '', t.lower()).strip()

        # Map phrases back to timestamps
        for concept in extracted_concepts:
            phrase = clean_text(concept.get("phrase", ""))
            name = clean_text(concept.get("name", ""))
            
            concept["timestamp"] = 0.0
            found = False
            
            # Priority 1: Match the exact phrase
            for s in segments:
                if phrase in clean_text(s['text']):
                    concept["timestamp"] = s['start']
                    found = True
                    break
            
            # Priority 2: Match the concept name
            if not found:
                for s in segments:
                    if name in clean_text(s['text']):
                        concept["timestamp"] = s['start']
                        found = True
                        break
        
        return extracted_concepts
        
    except Exception as e:
        print(f"Error during extraction: {e}")
        return []

if __name__ == "__main__":
    # Test stub
    test_text = "Today we are talking about Recursion. Recursion is when a function calls itself. It is often used in Merge Sort."
    concepts = extract_concepts(test_text)
    print(json.dumps(concepts, indent=2))
