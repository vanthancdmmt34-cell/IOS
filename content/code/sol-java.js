// Reference solutions (sol) and buggy starter code (bug) — Java 17. The main class is always named Main.
export default {
  "tong-hieu-tich": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong(), b = sc.nextLong();
        System.out.println(a + b);
        System.out.println(a - b);
        System.out.println(a * b);
    }
}
` },
  "hinh-chu-nhat": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long d = sc.nextLong(), r = sc.nextLong();
        System.out.println(2 * (d + r) + " " + d * r);
    }
}
` },
  "trung-binh-cong": { sol: `import java.util.Locale;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();
        double tb = (a + b + c) / 3.0;
        System.out.println(String.format(Locale.US, "%.2f", tb));
    }
}
`, bug: `import java.util.Locale;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();
        double tb = (a + b + c) / 3;
        System.out.println(String.format(Locale.US, "%.2f", tb));
    }
}
` },
  "chan-le": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        System.out.println(n % 2 == 0 ? "CHAN" : "LE");
    }
}
` },
  "xep-loai": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        double x = Double.parseDouble(sc.next());
        if (x >= 8) System.out.println("Gioi");
        else if (x >= 6.5) System.out.println("Kha");
        else if (x >= 5) System.out.println("Trung binh");
        else System.out.println("Yeu");
    }
}
` },
  "nam-nhuan": { sol: `import java.util.Scanner;

public class Main {
    static boolean laNamNhuan(int y) {
        return y % 400 == 0 || (y % 4 == 0 && y % 100 != 0);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int y = sc.nextInt();
        System.out.println(laNamNhuan(y) ? "YES" : "NO");
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    static boolean laNamNhuan(int y) {
        return y % 4 == 0 || y % 400 == 0 && y % 100 != 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int y = sc.nextInt();
        System.out.println(laNamNhuan(y) ? "YES" : "NO");
    }
}
` },
  "tong-1-n": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong(), s = 0;
        for (long i = 1; i <= n; i++) s += i;
        System.out.println(s);
    }
}
` },
  "giai-thua": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long f = 1;
        for (int i = 2; i <= n; i++) f *= i;
        System.out.println(f);
    }
}
` },
  "dem-chu-so": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        int dem = 0;
        do {
            dem++;
            n /= 10;
        } while (n > 0);
        System.out.println(dem);
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        int dem = 0;
        while (n > 0) {
            dem++;
            n /= 10;
        }
        System.out.println(dem);
    }
}
` },
  "tong-mang": { sol: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        long s = 0;
        for (int i = 0; i < n; i++) s += Long.parseLong(st.nextToken());
        System.out.println(s);
    }
}
` },
  "max-vi-tri": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long mx = sc.nextLong();
        int pos = 1;
        for (int i = 2; i <= n; i++) {
            long x = sc.nextLong();
            if (x > mx) { mx = x; pos = i; }
        }
        System.out.println(mx + " " + pos);
    }
}
` },
  "dem-so-duong": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int dem = 0;
        for (int i = 0; i < n; i++)
            if (a[i] > 0) dem++;
        System.out.println(dem);
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int dem = 0;
        for (int i = 0; i < a.length - 1; i++)
            if (a[i] > 0) dem++;
        System.out.println(dem);
    }
}
` },
  "dao-chuoi": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine() : "";
        System.out.println(new StringBuilder(s).reverse().toString());
    }
}
` },
  "dem-nguyen-am": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.hasNextLine() ? sc.nextLine().toLowerCase() : "";
        int dem = 0;
        for (char c : s.toCharArray())
            if ("aeiou".indexOf(c) >= 0) dem++;
        System.out.println(dem);
    }
}
` },
  "palindrome": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        boolean ok = true;
        int n = s.length();
        for (int i = 0; i < n / 2; i++)
            if (s.charAt(i) != s.charAt(n - 1 - i)) ok = false;
        System.out.println(ok ? "YES" : "NO");
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        boolean ok = true;
        int n = s.length();
        for (int i = 0; i < n / 2; i++)
            if (s.charAt(i) != s.charAt(n / 2 + i)) ok = false;
        System.out.println(ok ? "YES" : "NO");
    }
}
` },
  "ucln": { sol: `import java.util.Scanner;

public class Main {
    static long gcd(long a, long b) {
        return b == 0 ? a : gcd(b, a % b);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long a = sc.nextLong(), b = sc.nextLong();
        long g = gcd(a, b);
        System.out.println(g + " " + (a / g * b));
    }
}
` },
  "fibonacci": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] f = new long[Math.max(3, n + 1)];
        f[1] = 1; f[2] = 1;
        for (int i = 3; i <= n; i++) f[i] = f[i - 1] + f[i - 2];
        System.out.println(f[n]);
    }
}
` },
  "tong-chu-so-de-quy": { sol: `import java.util.Scanner;

public class Main {
    static int tongChuSo(long n) {
        if (n < 10) return (int) n;
        return (int) (n % 10) + tongChuSo(n / 10);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        System.out.println(tongChuSo(n));
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    static int tongChuSo(long n) {
        if (n < 10) return 0;
        return (int) (n % 10) + tongChuSo(n / 10);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong();
        System.out.println(tongChuSo(n));
    }
}
` },
  "tong-hang": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), n = sc.nextInt();
        for (int i = 0; i < m; i++) {
            long s = 0;
            for (int j = 0; j < n; j++) s += sc.nextLong();
            System.out.println(s);
        }
    }
}
` },
  "chuyen-vi": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int m = sc.nextInt(), n = sc.nextInt();
        int[][] a = new int[m][n];
        for (int i = 0; i < m; i++)
            for (int j = 0; j < n; j++) a[i][j] = sc.nextInt();
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < n; j++) {
            for (int i = 0; i < m; i++) sb.append(i > 0 ? " " : "").append(a[i][j]);
            sb.append("\\n");
        }
        System.out.print(sb);
    }
}
` },
  "duong-cheo": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[][] a = new long[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) a[i][j] = sc.nextLong();
        long chinh = 0, phu = 0;
        for (int i = 0; i < n; i++) {
            chinh += a[i][i];
            phu += a[i][n - 1 - i];
        }
        System.out.println(chinh + " " + phu);
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[][] a = new long[n][n];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++) a[i][j] = sc.nextLong();
        long chinh = 0, phu = 0;
        for (int i = 0; i < n; i++) {
            chinh += a[i][i];
            phu += a[i][n - 1];
        }
        System.out.println(chinh + " " + phu);
    }
}
` },
  "sap-xep": { sol: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        Arrays.sort(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
` },
  "tim-nhi-phan": { sol: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        StringTokenizer st = new StringTokenizer(br.readLine());
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = Integer.parseInt(st.nextToken());
        int q = Integer.parseInt(br.readLine().trim());
        st = new StringTokenizer(br.readLine());
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < q; i++) {
            int x = Integer.parseInt(st.nextToken());
            int k = Arrays.binarySearch(a, x);
            sb.append(i > 0 ? " " : "").append(k >= 0 ? k + 1 : -1);
        }
        System.out.println(sb);
    }
}
` },
  "dem-khac-nhau": { sol: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        Arrays.sort(a);
        int dem = 1;
        for (int i = 1; i < n; i++)
            if (a[i] != a[i - 1]) dem++;
        System.out.println(dem);
    }
}
`, bug: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        Arrays.sort(a);
        int dem = 0;
        for (int i = 1; i < n; i++)
            if (a[i] != a[i - 1]) dem++;
        System.out.println(dem);
    }
}
` },
  "dao-mang": { sol: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        ArrayList<Integer> a = new ArrayList<>();
        for (int i = 0; i < n; i++) a.add(sc.nextInt());
        Collections.reverse(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.size(); i++) sb.append(i > 0 ? " " : "").append(a.get(i));
        System.out.println(sb);
    }
}
` },
  "tan-suat-tu": { sol: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        TreeMap<String, Integer> dem = new TreeMap<>();
        for (int i = 0; i < n; i++) dem.merge(sc.next(), 1, Integer::sum);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Integer> e : dem.entrySet())
            sb.append(e.getKey()).append(" ").append(e.getValue()).append("\\n");
        System.out.print(sb);
    }
}
` },
  "phan-tu-duy-nhat": { sol: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        TreeSet<Integer> s = new TreeSet<>();
        for (int i = 0; i < n; i++) s.add(sc.nextInt());
        System.out.println(s.size());
        StringBuilder sb = new StringBuilder();
        for (int x : s) sb.append(sb.length() > 0 ? " " : "").append(x);
        System.out.println(sb);
    }
}
` },
  "phan-so": { sol: `import java.util.Scanner;

public class Main {
    static class PhanSo {
        long tu, mau;

        PhanSo(long tu, long mau) {
            long g = gcd(Math.abs(tu), Math.abs(mau));
            if (g == 0) g = 1;
            this.tu = tu / g;
            this.mau = mau / g;
            if (this.mau < 0) { this.tu = -this.tu; this.mau = -this.mau; }
        }

        static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }

        PhanSo cong(PhanSo o) { return new PhanSo(tu * o.mau + o.tu * mau, mau * o.mau); }

        @Override
        public String toString() { return tu + "/" + mau; }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        PhanSo x = new PhanSo(sc.nextLong(), sc.nextLong());
        PhanSo y = new PhanSo(sc.nextLong(), sc.nextLong());
        System.out.println(x.cong(y));
    }
}
` },
  "sinh-vien": { sol: `import java.util.*;

public class Main {
    static class SinhVien {
        String ten;
        double diem;
        SinhVien(String ten, double diem) { this.ten = ten; this.diem = diem; }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        List<SinhVien> ds = new ArrayList<>();
        for (int i = 0; i < n; i++) ds.add(new SinhVien(sc.next(), Double.parseDouble(sc.next())));
        SinhVien best = ds.get(0);
        for (SinhVien sv : ds)
            if (sv.diem > best.diem) best = sv;
        System.out.println(best.ten + " " + String.format(Locale.US, "%.1f", best.diem));
    }
}
` },
  "khoang-cach": { sol: `import java.util.*;

public class Main {
    static class Diem {
        double x, y;
        Diem(double x, double y) { this.x = x; this.y = y; }
        double khoangCach(Diem o) {
            return Math.sqrt((x - o.x) * (x - o.x) + (y - o.y) * (y - o.y));
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Diem a = new Diem(sc.nextInt(), sc.nextInt());
        Diem b = new Diem(sc.nextInt(), sc.nextInt());
        System.out.println(String.format(Locale.US, "%.2f", a.khoangCach(b)));
    }
}
`, bug: `import java.util.*;

public class Main {
    static class Diem {
        double x, y;
        Diem(double x, double y) { this.x = x; this.y = y; }
        double khoangCach(Diem o) {
            return Math.abs(x - o.x) + Math.abs(y - o.y);
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Diem a = new Diem(sc.nextInt(), sc.nextInt());
        Diem b = new Diem(sc.nextInt(), sc.nextInt());
        System.out.println(String.format(Locale.US, "%.2f", a.khoangCach(b)));
    }
}
` },
  "sang-nguyen-to": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        boolean[] hop = new boolean[n + 1];
        long dem = 0, tong = 0;
        for (int i = 2; i <= n; i++) {
            if (hop[i]) continue;
            dem++; tong += i;
            for (long j = (long) i * i; j <= n; j += i) hop[(int) j] = true;
        }
        System.out.println(dem);
        System.out.println(tong);
    }
}
` },
  "tong-doan": { sol: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken()), q = Integer.parseInt(st.nextToken());
        long[] p = new long[n + 1];
        st = new StringTokenizer(br.readLine());
        for (int i = 1; i <= n; i++) p[i] = p[i - 1] + Long.parseLong(st.nextToken());
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < q; k++) {
            st = new StringTokenizer(br.readLine());
            int l = Integer.parseInt(st.nextToken()), r = Integer.parseInt(st.nextToken());
            sb.append(p[r] - p[l - 1]).append("\\n");
        }
        System.out.print(sb);
    }
}
` },
  "so-hoan-hao": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong(), tong = 0;
        for (long i = 1; i < n; i++)
            if (n % i == 0) tong += i;
        System.out.println(n > 1 && tong == n ? "YES" : "NO");
    }
}
`, bug: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        long n = sc.nextLong(), tong = 0;
        for (long i = 1; i <= n; i++)
            if (n % i == 0) tong += i;
        System.out.println(n > 1 && tong == n ? "YES" : "NO");
    }
}
` },
  "leo-cau-thang": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long[] f = new long[n + 1];
        f[0] = 1;
        f[1] = 1;
        for (int i = 2; i <= n; i++) f[i] = f[i - 1] + f[i - 2];
        System.out.println(f[n]);
    }
}
` },
  "day-con-tang": { sol: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] a = new int[n], f = new int[n];
        for (int i = 0; i < n; i++) a[i] = sc.nextInt();
        int best = 0;
        for (int i = 0; i < n; i++) {
            f[i] = 1;
            for (int j = 0; j < i; j++)
                if (a[j] < a[i]) f[i] = Math.max(f[i], f[j] + 1);
            best = Math.max(best, f[i]);
        }
        System.out.println(best);
    }
}
` },
  "doi-tien": { sol: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int k = sc.nextInt(), S = sc.nextInt();
        int[] c = new int[k];
        for (int i = 0; i < k; i++) c[i] = sc.nextInt();
        int[] f = new int[S + 1];
        Arrays.fill(f, Integer.MAX_VALUE);
        f[0] = 0;
        for (int s = 1; s <= S; s++)
            for (int x : c)
                if (x <= s && f[s - x] != Integer.MAX_VALUE) f[s] = Math.min(f[s], f[s - x] + 1);
        System.out.println(f[S] == Integer.MAX_VALUE ? -1 : f[S]);
    }
}
` },
  "hieu-tuyet-doi": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong(), b = sc.nextLong();\n        System.out.println(Math.abs(a - b));\n    }\n}\n" },
  "so-sanh": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong(), b = sc.nextLong();\n        if (a > b) System.out.println(\"LON_HON\");\n        else if (a < b) System.out.println(\"NHO_HON\");\n        else System.out.println(\"BANG\");\n    }\n}\n" },
  "in-so-chan": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        for (int i = 2; i <= n; i += 2) System.out.println(i);\n    }\n}\n" },
  "dem-so-chan": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(), dem = 0;\n        for (int i = 0; i < n; i++) if (sc.nextLong() % 2 == 0) dem++;\n        System.out.println(dem);\n    }\n}\n" },
  "dao-mot-tu": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.next();\n        System.out.println(new StringBuilder(s).reverse());\n    }\n}\n" },
  "luy-thua": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong(), kq = 1; int b = sc.nextInt();\n        for (int i = 0; i < b; i++) kq *= a;\n        System.out.println(kq);\n    }\n}\n" },
  "tong-cheo": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt(); long s = 0;\n        for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) {\n            long x = sc.nextLong(); if (i == j) s += x;\n        }\n        System.out.println(s);\n    }\n}\n" },
  "so-khac-nhau": { sol: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextLong();\n        Arrays.sort(a);\n        int dem = 1;\n        for (int i = 1; i < n; i++) if (a[i] != a[i - 1]) dem++;\n        System.out.println(dem);\n    }\n}\n" },
  "ngan-xep": { sol: "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int q = sc.nextInt();\n        ArrayDeque<Long> st = new ArrayDeque<>();\n        for (int i = 0; i < q; i++) {\n            String op = sc.next();\n            if (op.equals(\"PUSH\")) st.push(sc.nextLong());\n            else System.out.println(st.pop());\n        }\n    }\n}\n" },
  "khoang-cach-diem": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long x1 = sc.nextLong(), y1 = sc.nextLong(), x2 = sc.nextLong(), y2 = sc.nextLong();\n        long dx = x1 - x2, dy = y1 - y2;\n        System.out.println(dx * dx + dy * dy);\n    }\n}\n" },
  "boi-chung": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong(), b = sc.nextLong(), x = a, y = b;\n        while (y != 0) { long r = x % y; x = y; y = r; }\n        System.out.println(a / x * b);\n    }\n}\n" },
  "fibo-n": { sol: "import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        long a = 1, b = 1;\n        for (int i = 3; i <= n; i++) { long c = a + b; a = b; b = c; }\n        System.out.println(n <= 2 ? 1 : b);\n    }\n}\n" },
};
