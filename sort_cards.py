import re

def sort_index():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = '<div class="research-grid">'
    end_marker = '</div>\n                </section>'

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx)

    if start_idx == -1 or end_idx == -1:
        print('Could not find grid boundaries')
        return

    grid_content = content[start_idx + len(start_marker):end_idx]

    pattern = re.compile(r'(?:(?:<!--.*?-->\s*)?<article.*?</article>)', re.DOTALL)
    cards = pattern.findall(grid_content)

    parsed_cards = []
    for card in cards:
        date_match = re.search(r'<span class="date">(\d{4})년 (\d{1,2})월</span>', card)
        if date_match:
            year = int(date_match.group(1))
            month = int(date_match.group(2))
            date_score = year * 100 + month
        else:
            date_score = 0
            
        is_featured = 1 if 'Featured' in card else 0
        parsed_cards.append((date_score, is_featured, card.strip('\n')))

    parsed_cards.sort(key=lambda x: (x[0], x[1]), reverse=True)

    new_grid_content = '\n                        '.join([x[2] for x in parsed_cards])

    new_content = content[:start_idx + len(start_marker)] + '\n                        ' + new_grid_content + '\n                    ' + content[end_idx:]

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'Successfully sorted {len(cards)} cards in index.html.')

if __name__ == '__main__':
    sort_index()
