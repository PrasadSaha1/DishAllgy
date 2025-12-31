# Install the library first
# pip install pyspellchecker

from spellchecker import SpellChecker

spell = SpellChecker()

text = "oiuachfiuasdhfiushfuiadshfuiasdhf"
words = text.split()

corrected_text = []

for word in words:
    correct_word = spell.correction(word)

    corrected_text.append(spell.correction(word))

final_text = " ".join(corrected_text)
print(final_text)

