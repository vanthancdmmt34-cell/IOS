// Reference solutions (sol) and buggy starter code (bug) — C++17.
export default {
  "tong-hieu-tich": { sol: `#include <iostream>
using namespace std;

int main() {
    long long a, b;
    cin >> a >> b;
    cout << a + b << "\\n" << a - b << "\\n" << a * b << "\\n";
    return 0;
}
` },
  "hinh-chu-nhat": { sol: `#include <iostream>
using namespace std;

int main() {
    long long d, r;
    cin >> d >> r;
    cout << 2 * (d + r) << " " << d * r << "\\n";
    return 0;
}
` },
  "trung-binh-cong": { sol: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    double tb = (a + b + c) / 3.0;
    cout << fixed << setprecision(2) << tb << "\\n";
    return 0;
}
`, bug: `#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int a, b, c;
    cin >> a >> b >> c;
    double tb = (a + b + c) / 3;
    cout << fixed << setprecision(2) << tb << "\\n";
    return 0;
}
` },
  "chan-le": { sol: `#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    cout << (n % 2 == 0 ? "CHAN" : "LE") << "\\n";
    return 0;
}
` },
  "xep-loai": { sol: `#include <iostream>
using namespace std;

int main() {
    double x;
    cin >> x;
    if (x >= 8) cout << "Gioi\\n";
    else if (x >= 6.5) cout << "Kha\\n";
    else if (x >= 5) cout << "Trung binh\\n";
    else cout << "Yeu\\n";
    return 0;
}
` },
  "nam-nhuan": { sol: `#include <iostream>
using namespace std;

bool laNamNhuan(int y) {
    return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);
}

int main() {
    int y;
    cin >> y;
    cout << (laNamNhuan(y) ? "YES" : "NO") << "\\n";
    return 0;
}
`, bug: `#include <iostream>
using namespace std;

bool laNamNhuan(int y) {
    return y % 4 == 0 && y % 100 != 0;
}

int main() {
    int y;
    cin >> y;
    cout << (laNamNhuan(y) ? "YES" : "NO") << "\\n";
    return 0;
}
` },
  "tong-1-n": { sol: `#include <iostream>
using namespace std;

int main() {
    long long n, s = 0;
    cin >> n;
    for (long long i = 1; i <= n; i++) s += i;
    cout << s << "\\n";
    return 0;
}
` },
  "giai-thua": { sol: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    unsigned long long f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    cout << f << "\\n";
    return 0;
}
` },
  "dem-chu-so": { sol: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    cout << s.size() << "\\n";
    return 0;
}
`, bug: `#include <iostream>
using namespace std;

int main() {
    unsigned long long n;
    cin >> n;
    int dem = 0;
    while (n > 0) {
        dem++;
        n /= 10;
    }
    cout << dem << "\\n";
    return 0;
}
` },
  "tong-mang": { sol: `#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    long long s = 0, x;
    for (int i = 0; i < n; i++) { cin >> x; s += x; }
    cout << s << "\\n";
    return 0;
}
` },
  "max-vi-tri": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n);
    for (auto &x : a) cin >> x;
    int pos = 0;
    for (int i = 1; i < n; i++)
        if (a[i] > a[pos]) pos = i;
    cout << a[pos] << " " << pos + 1 << "\\n";
    return 0;
}
` },
  "dem-so-duong": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int dem = 0;
    for (int i = 0; i < n; i++)
        if (a[i] > 0) dem++;
    cout << dem << "\\n";
    return 0;
}
`, bug: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    int dem = 0;
    for (int i = 1; i < n; i++)
        if (a[i - 1] > 0) dem++;
    cout << dem << "\\n";
    return 0;
}
` },
  "dao-chuoi": { sol: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    if (!s.empty() && s.back() == '\\r') s.pop_back();
    reverse(s.begin(), s.end());
    cout << s << "\\n";
    return 0;
}
` },
  "dem-nguyen-am": { sol: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    int dem = 0;
    for (char c : s) {
        char t = tolower((unsigned char)c);
        if (t == 'a' || t == 'e' || t == 'i' || t == 'o' || t == 'u') dem++;
    }
    cout << dem << "\\n";
    return 0;
}
` },
  "palindrome": { sol: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    bool ok = true;
    int n = s.size();
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - 1 - i]) ok = false;
    cout << (ok ? "YES" : "NO") << "\\n";
    return 0;
}
`, bug: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    bool ok = true;
    int n = s.size();
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - 2 - i]) ok = false;
    cout << (ok ? "YES" : "NO") << "\\n";
    return 0;
}
` },
  "ucln": { sol: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long g = gcd(a, b);
    cout << g << " " << a / g * b << "\\n";
    return 0;
}
` },
  "fibonacci": { sol: `#include <iostream>
using namespace std;

long long memo[91];

long long fib(int n) {
    if (n <= 2) return 1;
    if (memo[n]) return memo[n];
    return memo[n] = fib(n - 1) + fib(n - 2);
}

int main() {
    int n;
    cin >> n;
    cout << fib(n) << "\\n";
    return 0;
}
` },
  "tong-chu-so-de-quy": { sol: `#include <iostream>
using namespace std;

int tongChuSo(unsigned long long n) {
    if (n == 0) return 0;
    return n % 10 + tongChuSo(n / 10);
}

int main() {
    unsigned long long n;
    cin >> n;
    cout << tongChuSo(n) << "\\n";
    return 0;
}
`, bug: `#include <iostream>
using namespace std;

int tongChuSo(unsigned long long n) {
    if (n < 10) return 0;
    return n % 10 + tongChuSo(n / 10);
}

int main() {
    unsigned long long n;
    cin >> n;
    cout << tongChuSo(n) << "\\n";
    return 0;
}
` },
  "tong-hang": { sol: `#include <iostream>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    for (int i = 0; i < m; i++) {
        long long s = 0, x;
        for (int j = 0; j < n; j++) { cin >> x; s += x; }
        cout << s << "\\n";
    }
    return 0;
}
` },
  "chuyen-vi": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n));
    for (auto &row : a) for (auto &x : row) cin >> x;
    for (int j = 0; j < n; j++) {
        for (int i = 0; i < m; i++) cout << (i ? " " : "") << a[i][j];
        cout << "\\n";
    }
    return 0;
}
` },
  "duong-cheo": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<long long>> a(n, vector<long long>(n));
    for (auto &row : a) for (auto &x : row) cin >> x;
    long long chinh = 0, phu = 0;
    for (int i = 0; i < n; i++) {
        chinh += a[i][i];
        phu += a[i][n - 1 - i];
    }
    cout << chinh << " " << phu << "\\n";
    return 0;
}
`, bug: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<long long>> a(n, vector<long long>(n));
    for (auto &row : a) for (auto &x : row) cin >> x;
    long long chinh = 0, phu = 0;
    for (int i = 0; i < n; i++) {
        chinh += a[i][i];
        phu += a[n - 1 - i][n - 1 - i];
    }
    cout << chinh << " " << phu << "\\n";
    return 0;
}
` },
  "sap-xep": { sol: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    for (int i = 0; i < n; i++) cout << (i ? " " : "") << a[i];
    cout << "\\n";
    return 0;
}
` },
  "tim-nhi-phan": { sol: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    cin >> q;
    for (int i = 0; i < q; i++) {
        int x;
        cin >> x;
        auto it = lower_bound(a.begin(), a.end(), x);
        int pos = (it != a.end() && *it == x) ? int(it - a.begin()) + 1 : -1;
        cout << (i ? " " : "") << pos;
    }
    cout << "\\n";
    return 0;
}
` },
  "dem-khac-nhau": { sol: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    int dem = 1;
    for (int i = 1; i < n; i++)
        if (a[i] != a[i - 1]) dem++;
    cout << dem << "\\n";
    return 0;
}
`, bug: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto &x : a) cin >> x;
    sort(a.begin(), a.end());
    int dem = 0;
    for (int i = 1; i < n; i++)
        if (a[i] != a[i - 1]) dem++;
    cout << dem << "\\n";
    return 0;
}
` },
  "dao-mang": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a;
    for (int i = 0; i < n; i++) { int x; cin >> x; a.push_back(x); }
    for (int i = n - 1; i >= 0; i--) cout << a[i] << (i ? " " : "\\n");
    return 0;
}
` },
  "tan-suat-tu": { sol: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    map<string, int> dem;
    for (int i = 0; i < n; i++) { string w; cin >> w; dem[w]++; }
    for (const auto &[tu, so] : dem) cout << tu << " " << so << "\\n";
    return 0;
}
` },
  "phan-tu-duy-nhat": { sol: `#include <iostream>
#include <set>
using namespace std;

int main() {
    int n;
    cin >> n;
    set<int> s;
    for (int i = 0; i < n; i++) { int x; cin >> x; s.insert(x); }
    cout << s.size() << "\\n";
    bool dau = true;
    for (int x : s) { cout << (dau ? "" : " ") << x; dau = false; }
    cout << "\\n";
    return 0;
}
` },
  "phan-so": { sol: `#include <iostream>
#include <numeric>
using namespace std;

class PhanSo {
public:
    long long tu, mau;
    PhanSo(long long t, long long m) : tu(t), mau(m) { rutGon(); }
    void rutGon() {
        long long g = gcd(tu < 0 ? -tu : tu, mau < 0 ? -mau : mau);
        if (g == 0) g = 1;
        tu /= g; mau /= g;
        if (mau < 0) { tu = -tu; mau = -mau; }
    }
    PhanSo operator+(const PhanSo &o) const {
        return PhanSo(tu * o.mau + o.tu * mau, mau * o.mau);
    }
};

int main() {
    long long a, b, c, d;
    cin >> a >> b >> c >> d;
    PhanSo kq = PhanSo(a, b) + PhanSo(c, d);
    cout << kq.tu << "/" << kq.mau << "\\n";
    return 0;
}
` },
  "sinh-vien": { sol: `#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
using namespace std;

struct SinhVien {
    string ten;
    double diem;
};

int main() {
    int n;
    cin >> n;
    vector<SinhVien> ds(n);
    for (auto &sv : ds) cin >> sv.ten >> sv.diem;
    int best = 0;
    for (int i = 1; i < n; i++)
        if (ds[i].diem > ds[best].diem) best = i;
    cout << ds[best].ten << " " << fixed << setprecision(1) << ds[best].diem << "\\n";
    return 0;
}
` },
  "khoang-cach": { sol: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

class Diem {
public:
    double x, y;
    double khoangCach(const Diem &o) const {
        return sqrt((x - o.x) * (x - o.x) + (y - o.y) * (y - o.y));
    }
};

int main() {
    Diem a, b;
    cin >> a.x >> a.y >> b.x >> b.y;
    cout << fixed << setprecision(2) << a.khoangCach(b) << "\\n";
    return 0;
}
`, bug: `#include <iostream>
#include <iomanip>
#include <cmath>
using namespace std;

class Diem {
public:
    double x, y;
    double khoangCach(const Diem &o) const {
        return sqrt((x - o.x) * (x - o.x) + (y - o.y));
    }
};

int main() {
    Diem a, b;
    cin >> a.x >> a.y >> b.x >> b.y;
    cout << fixed << setprecision(2) << a.khoangCach(b) << "\\n";
    return 0;
}
` },
  "sang-nguyen-to": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<bool> nt(n + 1, true);
    long long dem = 0, tong = 0;
    for (long long i = 2; i <= n; i++) {
        if (!nt[i]) continue;
        dem++; tong += i;
        for (long long j = i * i; j <= n; j += i) nt[j] = false;
    }
    cout << dem << "\\n" << tong << "\\n";
    return 0;
}
` },
  "tong-doan": { sol: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> p(n + 1, 0);
    for (int i = 1; i <= n; i++) { long long x; cin >> x; p[i] = p[i - 1] + x; }
    while (q--) {
        int l, r;
        cin >> l >> r;
        cout << p[r] - p[l - 1] << "\\n";
    }
    return 0;
}
` },
  "so-hoan-hao": { sol: `#include <iostream>
using namespace std;

int main() {
    long long n, tong = 0;
    cin >> n;
    for (long long i = 1; i * i <= n; i++) {
        if (n % i) continue;
        tong += i;
        if (i != n / i) tong += n / i;
    }
    tong -= n;
    cout << (n > 1 && tong == n ? "YES" : "NO") << "\\n";
    return 0;
}
`, bug: `#include <iostream>
using namespace std;

int main() {
    long long n, tong = 0;
    cin >> n;
    for (long long i = 1; i * i <= n; i++) {
        if (n % i) continue;
        tong += i;
        if (i != n / i) tong += n / i;
    }
    cout << (n > 1 && tong == n ? "YES" : "NO") << "\\n";
    return 0;
}
` },
  "leo-cau-thang": { sol: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long a = 1, b = 1;
    for (int i = 2; i <= n; i++) { long long c = a + b; a = b; b = c; }
    cout << b << "\\n";
    return 0;
}
` },
  "day-con-tang": { sol: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n), tails;
    for (auto &x : a) cin >> x;
    for (int x : a) {
        auto it = lower_bound(tails.begin(), tails.end(), x);
        if (it == tails.end()) tails.push_back(x); else *it = x;
    }
    cout << tails.size() << "\\n";
    return 0;
}
` },
  "doi-tien": { sol: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

int main() {
    int k, S;
    cin >> k >> S;
    vector<int> c(k);
    for (auto &x : c) cin >> x;
    vector<int> f(S + 1, INT_MAX);
    f[0] = 0;
    for (int s = 1; s <= S; s++)
        for (int x : c)
            if (x <= s && f[s - x] != INT_MAX) f[s] = min(f[s], f[s - x] + 1);
    cout << (f[S] == INT_MAX ? -1 : f[S]) << "\\n";
    return 0;
}
` },
  "hieu-tuyet-doi": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    long long a, b, d; cin >> a >> b;\n    d = a - b; if (d < 0) d = -d;\n    cout << d << \"\\n\";\n    return 0;\n}\n" },
  "so-sanh": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    long long a, b; cin >> a >> b;\n    if (a > b) cout << \"LON_HON\\n\";\n    else if (a < b) cout << \"NHO_HON\\n\";\n    else cout << \"BANG\\n\";\n    return 0;\n}\n" },
  "in-so-chan": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    for (int i = 2; i <= n; i += 2) cout << i << \"\\n\";\n    return 0;\n}\n" },
  "dem-so-chan": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    int n, dem = 0; cin >> n;\n    for (int i = 0; i < n; i++) { long long x; cin >> x; if (x % 2 == 0) dem++; }\n    cout << dem << \"\\n\";\n    return 0;\n}\n" },
  "dao-mot-tu": { sol: "#include <iostream>\n#include <algorithm>\n#include <string>\nusing namespace std;\nint main() {\n    string s; cin >> s;\n    reverse(s.begin(), s.end());\n    cout << s << \"\\n\";\n    return 0;\n}\n" },
  "luy-thua": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    long long a, kq = 1; int b; cin >> a >> b;\n    for (int i = 0; i < b; i++) kq *= a;\n    cout << kq << \"\\n\";\n    return 0;\n}\n" },
  "tong-cheo": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n; long long s = 0;\n    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) {\n        long long x; cin >> x; if (i == j) s += x;\n    }\n    cout << s << \"\\n\";\n    return 0;\n}\n" },
  "so-khac-nhau": { sol: "#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    vector<long long> a(n);\n    for (auto &x : a) cin >> x;\n    sort(a.begin(), a.end());\n    int dem = 1;\n    for (int i = 1; i < n; i++) if (a[i] != a[i - 1]) dem++;\n    cout << dem << \"\\n\";\n    return 0;\n}\n" },
  "ngan-xep": { sol: "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\nint main() {\n    int q; cin >> q;\n    vector<long long> st;\n    for (int i = 0; i < q; i++) {\n        string op; cin >> op;\n        if (op == \"PUSH\") { long long x; cin >> x; st.push_back(x); }\n        else { cout << st.back() << \"\\n\"; st.pop_back(); }\n    }\n    return 0;\n}\n" },
  "khoang-cach-diem": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    long long x1, y1, x2, y2; cin >> x1 >> y1 >> x2 >> y2;\n    long long dx = x1 - x2, dy = y1 - y2;\n    cout << dx * dx + dy * dy << \"\\n\";\n    return 0;\n}\n" },
  "boi-chung": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    long long a, b; cin >> a >> b;\n    long long x = a, y = b, r;\n    while (y) { r = x % y; x = y; y = r; }\n    cout << a / x * b << \"\\n\";\n    return 0;\n}\n" },
  "fibo-n": { sol: "#include <iostream>\nusing namespace std;\nint main() {\n    int n; cin >> n;\n    long long a = 1, b = 1;\n    for (int i = 3; i <= n; i++) { long long c = a + b; a = b; b = c; }\n    cout << (n <= 2 ? 1 : b) << \"\\n\";\n    return 0;\n}\n" },
};
