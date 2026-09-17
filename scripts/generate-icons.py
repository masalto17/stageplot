#!/usr/bin/env python3
"""Genera los iconos PWA a partir del activo AUTORIZADO de MasAlto Producciones.

El logo no se recolorea, no se recorta ni se deforma: solo se escala de forma
uniforme y se centra sobre un lienzo cuadrado blanco (fondo claro permitido).

TODO: reemplazar cuando exista el activo monocromo autorizado de
MasAlto Producciones (hoy BLOQUEADO en el ASSET_MANIFEST del Brand Master).
"""
from PIL import Image
from pathlib import Path

SRC = Path("src/assets/brand/MasAlto_Producciones_Color_Fondo_Claro.png")
OUT = Path("public/icons")
BG = (255, 255, 255, 255)  # fondo claro autorizado para la variante color

# (nombre, lado, fraccion util del lienzo)
TARGETS = [
    ("pwa-192x192.png", 192, 0.82),
    ("pwa-512x512.png", 512, 0.82),
    ("pwa-maskable-512x512.png", 512, 0.62),  # zona segura del icono maskable
    ("apple-touch-icon-180x180.png", 180, 0.78),
    ("favicon-96x96.png", 96, 0.90),
]


def build(name: str, side: int, safe: float) -> None:
    logo = Image.open(SRC).convert("RGBA")
    max_w = int(side * safe)
    max_h = int(side * safe)
    scale = min(max_w / logo.width, max_h / logo.height)
    size = (max(1, round(logo.width * scale)), max(1, round(logo.height * scale)))
    resized = logo.resize(size, Image.LANCZOS)
    canvas = Image.new("RGBA", (side, side), BG)
    canvas.paste(resized, ((side - size[0]) // 2, (side - size[1]) // 2), resized)
    OUT.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT / name, "PNG", optimize=True)
    print(f"{name}: {side}x{side} (logo {size[0]}x{size[1]})")


if __name__ == "__main__":
    for target in TARGETS:
        build(*target)
