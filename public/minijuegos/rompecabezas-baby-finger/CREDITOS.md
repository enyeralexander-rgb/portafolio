# Créditos y licencias de la maqueta del Rompecabezas

Recursos de `docs/maquetas/rompecabezas/` (sprint B5, 2026-11-07). No se agregó ningún recurso nuevo descargado: todo
sale de las maquetas ya aprobadas o se dibuja por código. Al pasar a la APK se copian a `CREDITS.md` del proyecto.

## Fuentes

| Archivo | Origen | Licencia |
|---|---|---|
| `fuentes/Fredoka-Bold.ttf`, `fuentes/Fredoka-SemiBold.ttf` y `fuentes/OFL-Fredoka.txt` | Copias sin cambios de `docs/maquetas/memoria/fuentes/` (origen y SHA-256 en el `CREDITOS.md` de la sopa: repositorio hafontia-zz/Fredoka-One, commit `35c584ff`) | SIL Open Font License 1.1 |

## Sonidos y música

| Archivo | Origen | Licencia |
|---|---|---|
| `sonidos/musica-fondo.mp3` | Copia sin cambios de la memoria y la sopa: «Happy Clappy Loop» de OwlishMedia, https://opengameart.org/content/happy-clappy-loop | CC0, según la ficha de OpenGameArt (verificada en B1) |
| `sonidos/victoria.mp3` | Copia sin cambios: `jingles_SAX10.ogg` de «Music Jingles» de Kenney | CC0 1.0 |
| `sonidos/colocar.mp3` | Copia sin cambios de la memoria: `card-place-1.ogg` de Casino Audio 1.1 de Kenney. Aquí es el golpe de la pieza de cartón al encajar y al caer en la toalla | CC0 1.0 |
| `sonidos/voltear.mp3` | Copia sin cambios de la memoria: `card-slide-1.ogg` de Casino Audio 1.1 de Kenney. Aquí es el roce al tomar la pieza y al volver a la toalla | CC0 1.0 |
| `sonidos/barajar.mp3` | Copia sin cambios de la memoria: `card-shuffle.ogg` (primeros 1,2 s). Suena cuando las piezas saltan a la toalla | CC0 1.0 |
| `sonidos/abanico.mp3` | Copia sin cambios de la memoria: `card-fan-1.ogg`. Suena al aparecer la imagen | CC0 1.0 |

Origen y licencia de Casino Audio en el `CREDITOS.md` de la memoria (zip de OpenGameArt publicado por Kenney, SHA-256
`f36250766ac5bc378c13708ddf12a23a8e54a3251f8d482c7536e51b5dbafa18`, `License.txt` CC0).

Los demás sonidos (botón, pop al tomar la pieza, clic y arpegio del encaje, cuenta de la vista previa, tic de los
últimos 10 s, error, corazón que cae, olas, gaviotas, derrota) y la base musical de respaldo (`?musica=sintetizada`)
son síntesis propia con Web Audio, sin muestras. Si una muestra no carga, suena la síntesis.

## Imágenes

| Archivo | Origen | Permiso |
|---|---|---|
| `img/logo.png`, `img/logo.svg`, `img/bebe-sentado.png`, `img/bebe-ingeniero.png`, `img/panal-pants.png`, `img/panal-g.png`, `img/panal-acuatico.png`, `img/toallita-azul.png`, `img/toallita-blanca.png`, `img/toallita-rosa.png` | Copias sin cambios de `docs/maquetas/memoria/img/` (originales en `PRODUCTOS BABY FINGER`; tratamiento descrito en el `CREDITOS.md` de la memoria) | Recurso del propietario (marca Baby Finger) |
| Cielo, mar, isla, arena, olas, sombrilla, gaviotas, toalla, tablero, lámina de playa detrás de cada imagen, corazones, reloj, botones, confeti | Dibujados por código en la maqueta | Propio |

## Código

| Qué | Origen | Licencia |
|---|---|---|
| Forma de las pestañas: puntos de control de las tres curvas de Bézier de cada borde, pestaña del 20 % y variación del 4 % | Generador de rompecabezas de Draradech, https://github.com/Draradech/jigsaw (`jigsaw.html`, funciones `p0l` a `p9w`), consultado el 2026-11-07. Se reescribió con nombres propios; no se copió el archivo | Su `README.md` dice: todo es CC0 salvo la función de guardar (que no se usó) |
