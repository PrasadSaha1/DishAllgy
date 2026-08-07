from spellchecker import SpellChecker

def spell_check(text):
    spell = SpellChecker()
    words = text.split()
    corrected_text = []

    for word in words:
        correct_word = spell.correction(word)
        if not correct_word:
            corrected_text.append(word)  # If no correction found, keep the original word
        else:
            corrected_text.append(spell.correction(word))

    final_text = " ".join(corrected_text)
    return final_text