import whisper
import json
import os
from typing import List, Dict

def transcribe_video(video_path: str, model_name: str = "base") -> Dict:
    """
    Transcribes a video file using OpenAI's Whisper model.
    Captures word-level timestamps for granular navigation.
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    print(f"Loading Whisper model: {model_name}...")
    model = whisper.load_model(model_name)

    print(f"Transcribing {video_path}...")
    # Using word_timestamps=True for granular mapping
    result = model.transcribe(video_path, word_timestamps=True)

    # Simplified structure for LectureGraph
    processed_result = {
        "text": result["text"],
        "segments": []
    }

    for segment in result["segments"]:
        processed_result["segments"].append({
            "start": segment["start"],
            "end": segment["end"],
            "text": segment["text"].strip(),
            "words": [
                {
                    "word": w["word"].strip(),
                    "start": w["start"],
                    "end": w["end"]
                } for w in segment.get("words", [])
            ]
        })

    return processed_result

if __name__ == "__main__":
    # Test with a local file if provided
    import sys
    if len(sys.argv) > 1:
        video_file = sys.argv[1]
        output_file = "metadata.json"
        
        try:
            metadata = transcribe_video(video_file)
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)
            print(f"Success! Metadata saved to {output_file}")
        except Exception as e:
            print(f"Error: {e}")
    else:
        print("Usage: python transcription.py <path_to_video>")
