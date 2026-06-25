from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os

def generate_player_report(player_id: str, data: dict, output_path: str):
    """
    Generates a professional PDF report for a specific player.
    """
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, height - 80, f"Player Performance Report: {player_id}")
    
    # Subtitle
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.grey)
    c.drawString(100, height - 100, f"Generated on: {data.get('date', 'N/A')}")
    
    # Table of metrics
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(colors.black)
    c.drawString(100, height - 150, "Physical Metrics")
    
    c.setFont("Helvetica", 12)
    metrics = [
        ("Top Speed", f"{data.get('top_speed', 0):.2f} km/h"),
        ("Distance Covered", f"{data.get('distance', 0):.2f} m"),
        ("Ball Touches", f"{data.get('touches', 0)}"),
        ("Ball Losses", f"{data.get('losses', 0)}"),
        ("Possession Control", f"{data.get('possession', 0):.1f}%")
    ]
    
    y = height - 180
    for label, val in metrics:
        c.drawString(120, y, label)
        c.drawRightString(width - 120, y, val)
        y -= 25
        
    # Footer
    c.setFont("Helvetica-Oblique", 10)
    c.setFillColor(colors.grey)
    c.drawCentredString(width / 2, 50, "AI Football Analytics Platform - Professional Tactical Engine")
    
    c.save()
    return output_path
