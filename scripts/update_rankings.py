import requests
import json
import os
from datetime import datetime

# Apple iTunes RSS genreId 매핑
GENRE_MAP = {
    'all':       {'id': 6014, 'name': '전체'},      # 전체 게임
    'puzzle':    {'id': 7012, 'name': '퍼즐'},      # Puzzle
    'casual':    {'id': 7003, 'name': '캐주얼'},    # Casual
    'simulation':{'id': 7019, 'name': '시뮬레이션'} # Simulation
}

def fetch_genre(genre_key, limit):
    """특정 장르 iTunes RSS를 가져와 파싱합니다."""
    gid = GENRE_MAP[genre_key]['id']
    url = f'https://itunes.apple.com/kr/rss/topfreeapplications/limit={limit}/genre={gid}/json'
    
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    entries = data.get('feed', {}).get('entry', [])
    
    results = []
    for entry in entries:
        name    = entry.get('im:name', {}).get('label', '이름 없음')
        genre   = entry.get('category', {}).get('attributes', {}).get('label', GENRE_MAP[genre_key]['name'])
        img_list = entry.get('im:image', [])
        artwork = img_list[-1].get('label', '') if img_list else ''
        results.append({
            "name":       name,
            "genre":      genre,
            "artworkUrl": artwork,
            "trend":      "-"
        })
    return results

def update_rankings():
    print("🔄 Apple App Store 게임 순위 가져오는 중...")
    
    try:
        final_data = {
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "rankings": {}
        }

        # 전체 탭: 30위
        final_data["rankings"]["all"]        = fetch_genre("all",        30)
        print(f"  ✅ 전체 게임       : {len(final_data['rankings']['all'])}개")

        # 서브 장르 탭: 각 20위
        final_data["rankings"]["puzzle"]      = fetch_genre("puzzle",      20)
        print(f"  ✅ 퍼즐            : {len(final_data['rankings']['puzzle'])}개")

        final_data["rankings"]["casual"]      = fetch_genre("casual",      20)
        print(f"  ✅ 캐주얼          : {len(final_data['rankings']['casual'])}개")

        final_data["rankings"]["simulation"]  = fetch_genre("simulation",  20)
        print(f"  ✅ 시뮬레이션      : {len(final_data['rankings']['simulation'])}개")

        # data 폴더 확인 및 생성
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            
        # JSON 저장
        with open(os.path.join(data_dir, 'rankings.json'), 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=4)
        
        # JS 저장 (로컬 CORS 우회용)
        with open(os.path.join(data_dir, 'rankings.js'), 'w', encoding='utf-8') as f:
            f.write(f"const G_RANKING_DATA = {json.dumps(final_data, ensure_ascii=False, indent=4)};")
            
        print(f"\n✅ 게임 순위 데이터 갱신 완료!")
        print(f"📅 업데이트 시간: {final_data['lastUpdated']}")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
    
    print("\n-------------------------------------------")
    input("창을 닫으려면 [Enter] 키를 누르세요...")

if __name__ == "__main__":
    update_rankings()
