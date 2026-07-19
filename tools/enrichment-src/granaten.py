# Granaten, Raketen, Lenkraketen (GRW S. 435–437) — Waffenkatalog-Seite.
TARGET = 'weapons'
from _granaten import *

ENTRIES = {
 # Granate: Schock
 '9629810f-8db3-44a4-afc4-97eb5b391fb5': g(SCHOCK),
 # Granate: Flash-Pack
 'fdee91ef-c382-49c4-87f6-b9166b9bd9fa': g(FLASH, effects=[BLEND]),
 # Granate: Splitter
 'c674a254-d47b-4215-a12d-e6dd3f0910af': g(SPLITTER),
 # Granate: Gas
 'aecfccf7-d22e-4ead-abf9-e29f6dbf8550': g(GAS),
 # Granate: Spreng
 'cbe5694e-9da3-4aad-a0a0-036087dbab55': g(SPRENG),
 # Granate: Rauch
 'aab70ade-8586-4539-a184-99cb63e7bfab': g(RAUCH),
 # Granate: IR-Rauch
 '691ba610-d99a-4a86-a010-e21fa17e924c': g(IRRAUCH),
 # Aerodynamische Varianten
 '96810fa9-62c5-4638-b2b4-000e0910bd9a': g(SCHOCK, AERO),
 '54a82bb7-aacb-4b74-83ea-bfb441a81d60': g(FLASH, AERO, effects=[BLEND]),
 'd05adb5b-68d2-4905-8609-35e8e23310c4': g(SPLITTER, AERO),
 'a3fd9a2b-fc58-488b-be61-260bff2cfdca': g(GAS, AERO),
 '12d26925-582e-488e-b5ed-5202c9a78e33': g(SPRENG, AERO),
 'd7a09743-bee3-4736-a8cd-913adb07eab5': g(RAUCH, AERO),
 '9f39a37c-b53c-4b22-be27-c5ff35f1bb93': g(IRRAUCH, AERO),
 # Minigranaten
 'a12169ea-a345-407f-96a3-32bf32449bf3': g(SCHOCK, MINI),
 'a4aa3021-b760-4531-96af-6dcc19b6018e': g(FLASH, MINI, effects=[BLEND]),
 'dca59877-c9c9-4f53-81d2-9376c2b363cf': g(SPLITTER, MINI),
 'e5ce47b1-f829-4ecf-ab68-471ab782bf7c': g(GAS, MINI),
 'd7c9b470-018c-4d49-b954-6fbe39e0499b': g(SPRENG, MINI),
 '38d67d7b-91b6-4b24-a936-d6ac49fdd6df': g(RAUCH, MINI),
 '6247a897-218b-4488-bcd7-01c990703a9c': g(IRRAUCH, MINI),
 # Raketen
 '469a2853-64ea-4701-8c63-dfa905f9c6fb': {'description': RAK_AF + RAKETE},
 '5f60fc01-7411-4e55-9227-968391430d1f': {'description': RAK_SPLITTER + RAKETE},
 '0477cd16-a295-4ffa-b7ac-1f2c9471c5ed': {'description': RAK_SPRENG + RAKETE},
 # Lenkraketen
 '5f04a3bf-666e-4efd-a037-9cd053e6b1eb': {'description': RAK_AF + LENK},
 '046241b3-d009-4bed-b68b-89a3fcdbf99b': {'description': RAK_SPLITTER + LENK},
 '034a4b54-02d3-4891-84fa-931f0124e260': {'description': RAK_SPRENG + LENK},
}
