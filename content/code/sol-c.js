// Reference solutions (sol) and buggy starter code for "fix the bug" exercises (bug) — C language.
export default {
  "tong-hieu-tich": { sol: `#include <stdio.h>

int main(void) {
    long long a, b;
    scanf("%lld %lld", &a, &b);
    printf("%lld\\n%lld\\n%lld\\n", a + b, a - b, a * b);
    return 0;
}
` },
  "hinh-chu-nhat": { sol: `#include <stdio.h>

int main(void) {
    long long d, r;
    scanf("%lld %lld", &d, &r);
    printf("%lld %lld\\n", 2 * (d + r), d * r);
    return 0;
}
` },
  "trung-binh-cong": { sol: `#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    double tb = (a + b + c) / 3.0;
    printf("%.2f\\n", tb);
    return 0;
}
`, bug: `#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    double tb = (a + b + c) / 3;
    printf("%.2f\\n", tb);
    return 0;
}
` },
  "chan-le": { sol: `#include <stdio.h>

int main(void) {
    long long n;
    scanf("%lld", &n);
    if (n % 2 == 0) printf("CHAN\\n");
    else printf("LE\\n");
    return 0;
}
` },
  "xep-loai": { sol: `#include <stdio.h>

int main(void) {
    double x;
    scanf("%lf", &x);
    if (x >= 8) printf("Gioi\\n");
    else if (x >= 6.5) printf("Kha\\n");
    else if (x >= 5) printf("Trung binh\\n");
    else printf("Yeu\\n");
    return 0;
}
` },
  "nam-nhuan": { sol: `#include <stdio.h>

int main(void) {
    int y;
    scanf("%d", &y);
    if (y % 400 == 0 || (y % 4 == 0 && y % 100 != 0)) printf("YES\\n");
    else printf("NO\\n");
    return 0;
}
`, bug: `#include <stdio.h>

int main(void) {
    int y;
    scanf("%d", &y);
    if (y % 4 == 0) printf("YES\\n");
    else printf("NO\\n");
    return 0;
}
` },
  "tong-1-n": { sol: `#include <stdio.h>

int main(void) {
    long long n, s = 0;
    scanf("%lld", &n);
    for (long long i = 1; i <= n; i++) s += i;
    printf("%lld\\n", s);
    return 0;
}
` },
  "giai-thua": { sol: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    unsigned long long f = 1;
    for (int i = 2; i <= n; i++) f *= i;
    printf("%llu\\n", f);
    return 0;
}
` },
  "dem-chu-so": { sol: `#include <stdio.h>

int main(void) {
    unsigned long long n;
    scanf("%llu", &n);
    int dem = 0;
    do {
        dem++;
        n /= 10;
    } while (n > 0);
    printf("%d\\n", dem);
    return 0;
}
`, bug: `#include <stdio.h>

int main(void) {
    unsigned long long n;
    scanf("%llu", &n);
    int dem = 0;
    while (n > 0) {
        dem++;
        n /= 10;
    }
    printf("%d\\n", dem);
    return 0;
}
` },
  "tong-mang": { sol: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    long long s = 0, x;
    for (int i = 0; i < n; i++) { scanf("%lld", &x); s += x; }
    printf("%lld\\n", s);
    return 0;
}
` },
  "max-vi-tri": { sol: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    long long mx, x;
    int pos = 1;
    scanf("%lld", &mx);
    for (int i = 2; i <= n; i++) {
        scanf("%lld", &x);
        if (x > mx) { mx = x; pos = i; }
    }
    printf("%lld %d\\n", mx, pos);
    return 0;
}
` },
  "dem-so-duong": { sol: `#include <stdio.h>

int main(void) {
    int n, a[100000];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int dem = 0;
    for (int i = 0; i < n; i++)
        if (a[i] > 0) dem++;
    printf("%d\\n", dem);
    return 0;
}
`, bug: `#include <stdio.h>

int main(void) {
    int n, a[100000];
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int dem = 0;
    for (int i = 0; i < n - 1; i++)
        if (a[i] > 0) dem++;
    printf("%d\\n", dem);
    return 0;
}
` },
  "dao-chuoi": { sol: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[1105];
    if (!fgets(s, sizeof s, stdin)) return 0;
    s[strcspn(s, "\\r\\n")] = '\\0';
    for (int i = (int)strlen(s) - 1; i >= 0; i--) putchar(s[i]);
    putchar('\\n');
    return 0;
}
` },
  "dem-nguyen-am": { sol: `#include <stdio.h>
#include <ctype.h>
#include <string.h>

int main(void) {
    char s[2005];
    if (!fgets(s, sizeof s, stdin)) return 0;
    int dem = 0;
    for (int i = 0; s[i]; i++)
        if (strchr("aeiou", tolower((unsigned char)s[i])) && s[i] != '\\0') dem++;
    printf("%d\\n", dem);
    return 0;
}
` },
  "palindrome": { sol: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[1005];
    scanf("%1000s", s);
    int n = strlen(s), ok = 1;
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - 1 - i]) ok = 0;
    printf(ok ? "YES\\n" : "NO\\n");
    return 0;
}
`, bug: `#include <stdio.h>
#include <string.h>

int main(void) {
    char s[1005];
    scanf("%1000s", s);
    int n = strlen(s), ok = 1;
    for (int i = 0; i < n / 2; i++)
        if (s[i] != s[n - i]) ok = 0;
    printf(ok ? "YES\\n" : "NO\\n");
    return 0;
}
` },
  "ucln": { sol: `#include <stdio.h>

long long gcd(long long a, long long b) {
    while (b != 0) {
        long long r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main(void) {
    long long a, b;
    scanf("%lld %lld", &a, &b);
    long long g = gcd(a, b);
    printf("%lld %lld\\n", g, a / g * b);
    return 0;
}
` },
  "fibonacci": { sol: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    long long a = 1, b = 1;
    for (int i = 3; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    printf("%lld\\n", b);
    return 0;
}
` },
  "tong-chu-so-de-quy": { sol: `#include <stdio.h>

int tongChuSo(unsigned long long n) {
    if (n < 10) return (int)n;
    return (int)(n % 10) + tongChuSo(n / 10);
}

int main(void) {
    unsigned long long n;
    scanf("%llu", &n);
    printf("%d\\n", tongChuSo(n));
    return 0;
}
`, bug: `#include <stdio.h>

int tongChuSo(unsigned long long n) {
    if (n < 10) return 0;
    return (int)(n % 10) + tongChuSo(n / 10);
}

int main(void) {
    unsigned long long n;
    scanf("%llu", &n);
    printf("%d\\n", tongChuSo(n));
    return 0;
}
` },
  "tong-hang": { sol: `#include <stdio.h>

int main(void) {
    int m, n;
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; i++) {
        long long s = 0, x;
        for (int j = 0; j < n; j++) { scanf("%lld", &x); s += x; }
        printf("%lld\\n", s);
    }
    return 0;
}
` },
  "chuyen-vi": { sol: `#include <stdio.h>

int a[100][100];

int main(void) {
    int m, n;
    scanf("%d %d", &m, &n);
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
    for (int j = 0; j < n; j++) {
        for (int i = 0; i < m; i++) printf(i ? " %d" : "%d", a[i][j]);
        printf("\\n");
    }
    return 0;
}
` },
  "duong-cheo": { sol: `#include <stdio.h>

int a[100][100];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
    long long chinh = 0, phu = 0;
    for (int i = 0; i < n; i++) {
        chinh += a[i][i];
        phu += a[i][n - 1 - i];
    }
    printf("%lld %lld\\n", chinh, phu);
    return 0;
}
`, bug: `#include <stdio.h>

int a[100][100];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) scanf("%d", &a[i][j]);
    long long chinh = 0, phu = 0;
    for (int i = 0; i < n; i++) {
        chinh += a[i][i];
        phu += a[i][n - i];
    }
    printf("%lld %lld\\n", chinh, phu);
    return 0;
}
` },
  "sap-xep": { sol: `#include <stdio.h>
#include <stdlib.h>

int cmp(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

int a[100000];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    qsort(a, n, sizeof a[0], cmp);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\\n");
    return 0;
}
` },
  "tim-nhi-phan": { sol: `#include <stdio.h>

int a[100000];

int timKiem(int n, int x) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (a[m] == x) return m + 1;
        if (a[m] < x) l = m + 1; else r = m - 1;
    }
    return -1;
}

int main(void) {
    int n, q, x;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &q);
    for (int i = 0; i < q; i++) {
        scanf("%d", &x);
        printf(i ? " %d" : "%d", timKiem(n, x));
    }
    printf("\\n");
    return 0;
}
` },
  "dem-khac-nhau": { sol: `#include <stdio.h>
#include <stdlib.h>

int cmp(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

int a[100000];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    qsort(a, n, sizeof a[0], cmp);
    int dem = 1;
    for (int i = 1; i < n; i++)
        if (a[i] != a[i - 1]) dem++;
    printf("%d\\n", dem);
    return 0;
}
`, bug: `#include <stdio.h>
#include <stdlib.h>

int cmp(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

int a[100000];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    qsort(a, n, sizeof a[0], cmp);
    int dem = 0;
    for (int i = 1; i < n; i++)
        if (a[i] != a[i - 1]) dem++;
    printf("%d\\n", dem);
    return 0;
}
` },
  "dao-mang": { sol: `#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int n;
    scanf("%d", &n);
    int *a = (int *)malloc(n * sizeof(int));
    if (a == NULL) return 1;
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = n - 1; i >= 0; i--) printf(i == n - 1 ? "%d" : " %d", a[i]);
    printf("\\n");
    free(a);
    return 0;
}
` },
  "tan-suat-tu": { sol: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char w[10000][21];

int cmp(const void *a, const void *b) { return strcmp((const char *)a, (const char *)b); }

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%20s", w[i]);
    qsort(w, n, sizeof w[0], cmp);
    int dem = 1;
    for (int i = 1; i <= n; i++) {
        if (i < n && strcmp(w[i], w[i - 1]) == 0) dem++;
        else { printf("%s %d\\n", w[i - 1], dem); dem = 1; }
    }
    return 0;
}
` },
  "phan-tu-duy-nhat": { sol: `#include <stdio.h>
#include <stdlib.h>

int cmp(const void *x, const void *y) {
    int a = *(const int *)x, b = *(const int *)y;
    return (a > b) - (a < b);
}

int main(void) {
    int n;
    scanf("%d", &n);
    int *a = (int *)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    qsort(a, n, sizeof(int), cmp);
    int k = 0;
    for (int i = 0; i < n; i++)
        if (i == 0 || a[i] != a[i - 1]) a[k++] = a[i];
    printf("%d\\n", k);
    for (int i = 0; i < k; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\\n");
    free(a);
    return 0;
}
` },
  "phan-so": { sol: `#include <stdio.h>
#include <stdlib.h>

typedef struct {
    long long tu, mau;
} PhanSo;

long long gcd(long long a, long long b) {
    a = llabs(a); b = llabs(b);
    while (b) { long long r = a % b; a = b; b = r; }
    return a;
}

PhanSo rutGon(PhanSo p) {
    long long g = gcd(p.tu, p.mau);
    if (g == 0) g = 1;
    p.tu /= g; p.mau /= g;
    if (p.mau < 0) { p.tu = -p.tu; p.mau = -p.mau; }
    return p;
}

PhanSo cong(PhanSo x, PhanSo y) {
    PhanSo kq = { x.tu * y.mau + y.tu * x.mau, x.mau * y.mau };
    return rutGon(kq);
}

int main(void) {
    PhanSo x, y;
    scanf("%lld %lld %lld %lld", &x.tu, &x.mau, &y.tu, &y.mau);
    PhanSo z = cong(x, y);
    printf("%lld/%lld\\n", z.tu, z.mau);
    return 0;
}
` },
  "sinh-vien": { sol: `#include <stdio.h>

typedef struct {
    char ten[51];
    double diem;
} SinhVien;

SinhVien ds[1000];

int main(void) {
    int n;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%50s %lf", ds[i].ten, &ds[i].diem);
    int best = 0;
    for (int i = 1; i < n; i++)
        if (ds[i].diem > ds[best].diem) best = i;
    printf("%s %.1f\\n", ds[best].ten, ds[best].diem);
    return 0;
}
` },
  "khoang-cach": { sol: `#include <stdio.h>
#include <math.h>

typedef struct { double x, y; } Diem;

double khoangCach(Diem a, Diem b) {
    double dx = a.x - b.x, dy = a.y - b.y;
    return sqrt(dx * dx + dy * dy);
}

int main(void) {
    Diem a, b;
    scanf("%lf %lf %lf %lf", &a.x, &a.y, &b.x, &b.y);
    printf("%.2f\\n", khoangCach(a, b));
    return 0;
}
`, bug: `#include <stdio.h>
#include <math.h>

typedef struct { double x, y; } Diem;

double khoangCach(Diem a, Diem b) {
    double dx = a.x - b.x, dy = a.y - b.y;
    return sqrt(dx + dy);
}

int main(void) {
    Diem a, b;
    scanf("%lf %lf %lf %lf", &a.x, &a.y, &b.x, &b.y);
    printf("%.2f\\n", khoangCach(a, b));
    return 0;
}
` },
  "sang-nguyen-to": { sol: `#include <stdio.h>
#include <string.h>

char hop[1000001];

int main(void) {
    int n;
    scanf("%d", &n);
    memset(hop, 0, sizeof hop);
    long long dem = 0, tong = 0;
    for (long long i = 2; i <= n; i++) {
        if (hop[i]) continue;
        dem++; tong += i;
        for (long long j = i * i; j <= n; j += i) hop[j] = 1;
    }
    printf("%lld\\n%lld\\n", dem, tong);
    return 0;
}
` },
  "tong-doan": { sol: `#include <stdio.h>

long long p[100001];

int main(void) {
    int n, q;
    scanf("%d %d", &n, &q);
    for (int i = 1; i <= n; i++) {
        long long x;
        scanf("%lld", &x);
        p[i] = p[i - 1] + x;
    }
    while (q--) {
        int l, r;
        scanf("%d %d", &l, &r);
        printf("%lld\\n", p[r] - p[l - 1]);
    }
    return 0;
}
` },
  "so-hoan-hao": { sol: `#include <stdio.h>

int main(void) {
    long long n, tong = 0;
    scanf("%lld", &n);
    for (long long i = 1; i < n; i++)
        if (n % i == 0) tong += i;
    printf(n > 1 && tong == n ? "YES\\n" : "NO\\n");
    return 0;
}
`, bug: `#include <stdio.h>

int main(void) {
    long long n, tong = 0;
    scanf("%lld", &n);
    for (long long i = 1; i <= n; i++)
        if (n % i == 0) tong += i;
    printf(n > 1 && tong == n ? "YES\\n" : "NO\\n");
    return 0;
}
` },
  "leo-cau-thang": { sol: `#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    long long f[81];
    f[0] = 1; f[1] = 1;
    for (int i = 2; i <= n; i++) f[i] = f[i - 1] + f[i - 2];
    printf("%lld\\n", f[n]);
    return 0;
}
` },
  "day-con-tang": { sol: `#include <stdio.h>

int a[2000], f[2000];

int main(void) {
    int n, best = 0;
    scanf("%d", &n);
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    for (int i = 0; i < n; i++) {
        f[i] = 1;
        for (int j = 0; j < i; j++)
            if (a[j] < a[i] && f[j] + 1 > f[i]) f[i] = f[j] + 1;
        if (f[i] > best) best = f[i];
    }
    printf("%d\\n", best);
    return 0;
}
` },
  "doi-tien": { sol: `#include <stdio.h>

int main(void) {
    int k, S, c[20];
    scanf("%d %d", &k, &S);
    for (int i = 0; i < k; i++) scanf("%d", &c[i]);
    const int INF = 1000000000;
    static int f[10001];
    f[0] = 0;
    for (int s = 1; s <= S; s++) {
        f[s] = INF;
        for (int i = 0; i < k; i++)
            if (c[i] <= s && f[s - c[i]] + 1 < f[s]) f[s] = f[s - c[i]] + 1;
    }
    printf("%d\\n", f[S] >= INF ? -1 : f[S]);
    return 0;
}
` },
  "hieu-tuyet-doi": { sol: "#include <stdio.h>\nint main(void) {\n    long long a, b, d;\n    scanf(\"%lld %lld\", &a, &b);\n    d = a - b;\n    if (d < 0) d = -d;\n    printf(\"%lld\\n\", d);\n    return 0;\n}\n" },
  "so-sanh": { sol: "#include <stdio.h>\nint main(void) {\n    long long a, b;\n    scanf(\"%lld %lld\", &a, &b);\n    if (a > b) printf(\"LON_HON\\n\");\n    else if (a < b) printf(\"NHO_HON\\n\");\n    else printf(\"BANG\\n\");\n    return 0;\n}\n" },
  "in-so-chan": { sol: "#include <stdio.h>\nint main(void) {\n    int n, i;\n    scanf(\"%d\", &n);\n    for (i = 2; i <= n; i += 2) printf(\"%d\\n\", i);\n    return 0;\n}\n" },
  "dem-so-chan": { sol: "#include <stdio.h>\nint main(void) {\n    int n, i, x, dem = 0;\n    scanf(\"%d\", &n);\n    for (i = 0; i < n; i++) { scanf(\"%d\", &x); if (x % 2 == 0) dem++; }\n    printf(\"%d\\n\", dem);\n    return 0;\n}\n" },
  "dao-mot-tu": { sol: "#include <stdio.h>\n#include <string.h>\nint main(void) {\n    char s[100005];\n    int i, n;\n    scanf(\"%s\", s);\n    n = (int)strlen(s);\n    for (i = n - 1; i >= 0; i--) putchar(s[i]);\n    putchar('\\n');\n    return 0;\n}\n" },
  "luy-thua": { sol: "#include <stdio.h>\nint main(void) {\n    long long a, kq = 1;\n    int b, i;\n    scanf(\"%lld %d\", &a, &b);\n    for (i = 0; i < b; i++) kq *= a;\n    printf(\"%lld\\n\", kq);\n    return 0;\n}\n" },
  "tong-cheo": { sol: "#include <stdio.h>\nint main(void) {\n    int n, i, j, x;\n    long long s = 0;\n    scanf(\"%d\", &n);\n    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {\n        scanf(\"%d\", &x);\n        if (i == j) s += x;\n    }\n    printf(\"%lld\\n\", s);\n    return 0;\n}\n" },
  "so-khac-nhau": { sol: "#include <stdio.h>\n#include <stdlib.h>\nstatic int cmp(const void *p, const void *q) {\n    long long a = *(const long long *)p, b = *(const long long *)q;\n    return (a > b) - (a < b);\n}\nint main(void) {\n    int n, i, dem = 1;\n    scanf(\"%d\", &n);\n    long long *a = malloc((size_t)n * sizeof(long long));\n    for (i = 0; i < n; i++) scanf(\"%lld\", &a[i]);\n    qsort(a, (size_t)n, sizeof(long long), cmp);\n    for (i = 1; i < n; i++) if (a[i] != a[i - 1]) dem++;\n    printf(\"%d\\n\", dem);\n    free(a);\n    return 0;\n}\n" },
  "ngan-xep": { sol: "#include <stdio.h>\nint main(void) {\n    int q, i, top = 0;\n    static long long st[100005];\n    char op[8];\n    scanf(\"%d\", &q);\n    for (i = 0; i < q; i++) {\n        scanf(\"%s\", op);\n        if (op[1] == 'U') { scanf(\"%lld\", &st[top]); top++; }\n        else { top--; printf(\"%lld\\n\", st[top]); }\n    }\n    return 0;\n}\n" },
  "khoang-cach-diem": { sol: "#include <stdio.h>\nint main(void) {\n    long long x1, y1, x2, y2, dx, dy;\n    scanf(\"%lld %lld %lld %lld\", &x1, &y1, &x2, &y2);\n    dx = x1 - x2; dy = y1 - y2;\n    printf(\"%lld\\n\", dx * dx + dy * dy);\n    return 0;\n}\n" },
  "boi-chung": { sol: "#include <stdio.h>\nint main(void) {\n    long long a, b, x, y, r;\n    scanf(\"%lld %lld\", &a, &b);\n    x = a; y = b;\n    while (y) { r = x % y; x = y; y = r; }\n    printf(\"%lld\\n\", a / x * b);\n    return 0;\n}\n" },
  "fibo-n": { sol: "#include <stdio.h>\nint main(void) {\n    int n, i;\n    long long a = 1, b = 1, c;\n    scanf(\"%d\", &n);\n    if (n <= 2) { printf(\"1\\n\"); return 0; }\n    for (i = 3; i <= n; i++) { c = a + b; a = b; b = c; }\n    printf(\"%lld\\n\", b);\n    return 0;\n}\n" },
};
