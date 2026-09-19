#!/usr/bin/env python3
"""Genera imagenes OG (1200x630) para cada pagina publica.

Diseño:
  - Fondo blanco
  - Barra roja arriba (banda de marca)
  - Logo autorizado de MasAlto Producciones abajo a la derecha
  - Titulo grande a la izquierda
  - Subtitulo mas chico debajo
  - Etiqueta "MasAlto StagePlot" arriba

Fuentes: intenta usar Nunito Sans (Google Fonts, se descarga si no existe);
fallback a DejaVu Sans (default en runners Ubuntu) y Helvetica (Mac dev).
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import urllib.request
import sys

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "public" / "og"
FUENTES = RAIZ / ".og-fonts"
SALIDA.mkdir(parents=True, exist_ok=True)
FUENTES.mkdir(parents=True, exist_ok=True)

# Descargar Nunito Sans Bold + Regular al build para consistencia entre local
# y CI. Sin esto, el runner de Ubuntu tira DejaVu (aceptable pero distinto).
# NunitoSans variable font desde google/fonts (URL estable, con caching).
URLS_FUENTES = {
    "NunitoSans.ttf":
        "https://raw.githubusercontent.com/google/fonts/main/ofl/nunitosans/NunitoSans%5BYTLC%2Copsz%2Cwdth%2Cwght%5D.ttf",
}

def cargar_fuente(_nombre: str, tamano: int, peso: int = 700) -> ImageFont.FreeTypeFont:
    """Carga NunitoSans variable con el peso pedido. Fallback a system fonts
    o al default de PIL si nada esta disponible."""
    ruta = FUENTES / "NunitoSans.ttf"
    if not ruta.exists():
        url = URLS_FUENTES["NunitoSans.ttf"]
        try:
            print(f"Descargando NunitoSans...", file=sys.stderr)
            urllib.request.urlretrieve(url, ruta)
        except Exception as e:
            print(f"No se pudo descargar NunitoSans: {e}", file=sys.stderr)
    if ruta.exists():
        f = ImageFont.truetype(str(ruta), tamano)
        try:
            f.set_variation_by_axes([200, 12, 100, peso])  # YTLC, opsz, wdth, wght
        except Exception:
            pass
        return f
    for candidato in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/HelveticaNeue.ttc",
    ):
        pp = Path(candidato)
        if pp.exists():
            return ImageFont.truetype(str(pp), tamano)
    return ImageFont.load_default()

# --- Diseño ---

W, H = 1200, 630
ROJO = (227, 6, 19)
NEGRO = (0, 0, 0)
BLANCO = (255, 255, 255)
GRIS = (110, 110, 110)

LOGO = RAIZ / "src" / "assets" / "brand" / "MasAlto_Producciones_Color_Fondo_Claro.png"

# --- Layout de texto: envolver el titulo en varias lineas ---

def envolver(txt: str, fuente, ancho_max: int, dibujo: ImageDraw.ImageDraw) -> list[str]:
    palabras = txt.split()
    lineas = []
    linea = ""
    for p in palabras:
        prueba = f"{linea} {p}".strip()
        bbox = dibujo.textbbox((0, 0), prueba, font=fuente)
        if bbox[2] - bbox[0] <= ancho_max or not linea:
            linea = prueba
        else:
            lineas.append(linea)
            linea = p
    if linea:
        lineas.append(linea)
    return lineas

def generar(slug: str, titulo: str, subtitulo: str, etiqueta: str = "MasAlto StagePlot"):
    im = Image.new("RGB", (W, H), BLANCO)
    d = ImageDraw.Draw(im)

    # Barra roja arriba.
    d.rectangle([0, 0, W, 8], fill=ROJO)

    # Etiqueta chip: "MasAlto StagePlot" arriba en gris.
    fuente_chip = cargar_fuente("bold", 24, 800)
    d.text((80, 60), etiqueta.upper(), font=fuente_chip, fill=ROJO)

    # Titulo grande.
    ancho_texto = W - 160
    for tamano in (78, 66, 56, 48):
        fuente_titulo = cargar_fuente("bold", tamano, 800)
        lineas = envolver(titulo, fuente_titulo, ancho_texto, d)
        if len(lineas) <= 3:
            break
    else:
        lineas = envolver(titulo, fuente_titulo, ancho_texto, d)

    # Calcular altura y posicion.
    alto_linea = tamano + 8
    y0 = 130
    for i, ln in enumerate(lineas):
        d.text((80, y0 + i * alto_linea), ln, font=fuente_titulo, fill=NEGRO)

    # Subtitulo.
    fuente_sub = cargar_fuente("regular", 28, 400)
    sub_lineas = envolver(subtitulo, fuente_sub, ancho_texto, d)
    y_sub = y0 + len(lineas) * alto_linea + 30
    for i, ln in enumerate(sub_lineas[:3]):
        d.text((80, y_sub + i * 40), ln, font=fuente_sub, fill=GRIS)

    # Logo abajo a la derecha.
    if LOGO.exists():
        logo = Image.open(LOGO).convert("RGBA")
        escala = 200 / logo.width
        w = int(logo.width * escala)
        h = int(logo.height * escala)
        logo = logo.resize((w, h), Image.LANCZOS)
        im.paste(logo, (W - w - 60, H - h - 60), logo)

    # Marca URL abajo a la izquierda.
    fuente_url = cargar_fuente("bold", 22, 700)
    d.text((80, H - 60), "masalto.com.ar/stageplot", font=fuente_url, fill=ROJO)

    ruta = SALIDA / f"{slug}.png"
    im.save(ruta, "PNG", optimize=True)
    print(f"  {slug}.png ({im.size[0]}x{im.size[1]}, {ruta.stat().st_size // 1024} kB)")

# --- Paginas a generar ---

PAGINAS = [
    ("default", "MasAlto StagePlot",
     "Crea el stage plot y el input list de tu show y compartilos en PDF. Gratis, sin registro."),
    ("guias-index", "Guias tecnicas",
     "Aprende a armar stage plots, input lists y riders tecnicos. Guias practicas para bandas y sonidistas."),
    ("guia-como-armar", "Como armar un stage plot",
     "Que es, que informacion lleva, como se lee, y armar el tuyo en 15 minutos."),
    ("guia-input-list", "Que es un input list",
     "El otro papel que va con el stage plot: mic, DI, stand, +48V y notas por canal."),
    ("plantillas-index", "Plantillas por genero",
     "Rock, solista, DJ y folklore. Empeza desde el setup tipo de tu genero."),
    ("plantilla-rock", "Stage plot para banda de rock",
     "Setup clasico: bateria, bajo, dos guitarras, teclado, voz y coros. 21 canales listos."),
    ("plantilla-solista", "Stage plot para solista con guitarra",
     "Setup minimo: voz + guitarra acustica + un monitor. 3 canales, PDF en 60 segundos."),
    ("plantilla-dj", "Stage plot para set de DJ",
     "Cabina + MC + monitores. 5 canales. Rider listo para festivales y boliches."),
    ("plantilla-folklore", "Stage plot para folklore argentino",
     "Dos voces, guitarras acusticas, bongo y cajon. Chacarera, zamba y peña."),
]

if __name__ == "__main__":
    print("Generando OG images:")
    for slug, titulo, subtitulo in PAGINAS:
        generar(slug, titulo, subtitulo)
    print(f"OK: {len(PAGINAS)} imagenes en {SALIDA}")
