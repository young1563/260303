import requests
import json
import os
from datetime import datetime

def update_rankings():
    # App Store KR Top Free Apps RSS URL
    url = "https://rss.applemarketingtools.com/api/v2/kr/apps/top-free/20/apps.json"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        apps = data.get('feed', {}).get('results', [])
        
        if not apps:
            print("⚠️ 가져올 게임 데이터가 없습니다.")
            return

        results = []
        for app in apps:
            # 장르 데이터 안전하게 가져오기
            genres = app.get('genres', [])
            genre_name = genres[0].get('name', '기타') if genres else '기타'
            
            results.append({
                "name": app.get('name', '이름 없음'),
                "genre": genre_name,
                "artworkUrl": app.get('artworkUrl100', ''),
                "trend": "-" # Default trend
            })
            
        final_data = {
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "rankings": results
        }
        
        # Save to data/rankings.json
        data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            
        # JSON 저장
        with open(os.path.join(data_dir, 'rankings.json'), 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=4)
        
        # JS 저장 (로컬 파일 실행 시 보안 문제 해결용)
        with open(os.path.join(data_dir, 'rankings.js'), 'w', encoding='utf-8') as f:
            f.write(f"const G_RANKING_DATA = {json.dumps(final_data, ensure_ascii=False, indent=4)};")
            
        print("\n✅ 순위 데이터(JSON/JS)가 성공적으로 갱신되었습니다!")
        print(f"업데이트 시간: {final_data['lastUpdated']}")
        
    except Exception as e:
        print(f"\n❌ 오류 발생: {e}")
    
    print("\n-------------------------------------------")
    input("창을 닫으려면 [Enter] 키를 누르세요...")

if __name__ == "__main__":
    update_rankings()
