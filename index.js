#include <bits/stdc++.h>
#include <cmath> // Added for llround
#include <fstream>
#include <regex>
using namespace std;

// decode string in base (2..36) → long long (can be extended to BigInt if needed)
long long decodeBase(const string &val, int base)
{
    string s = val;
    bool neg = false;
    if (s[0] == '-')
    {
        neg = true;
        s = s.substr(1);
    }
    long long acc = 0;
    for (char c : s)
    {
        int digit;
        if (isdigit(c))
            digit = c - '0';
        else if (isalpha(c))
            digit = toupper(c) - 'A' + 10;
        else
            continue;
        acc = acc * base + digit;
    }
    return neg ? -acc : acc;
}

// Simple JSON parser for our specific format
struct TestCase
{
    int n, k;
    vector<pair<int, pair<int, string>>> points; // x, (base, value)
};

TestCase parseJSON(const string &filename)
{
    TestCase tc;
    ifstream file(filename);
    string content((istreambuf_iterator<char>(file)), istreambuf_iterator<char>());

    // Parse n and k
    regex nRegex("\"n\":\\s*(\\d+)");
    regex kRegex("\"k\":\\s*(\\d+)");
    smatch match;

    if (regex_search(content, match, nRegex))
    {
        tc.n = stoi(match[1]);
    }
    if (regex_search(content, match, kRegex))
    {
        tc.k = stoi(match[1]);
    }

    // Parse points - simpler approach
    size_t pos = 0;
    while (pos < content.length())
    {
        size_t start = content.find("\"", pos);
        if (start == string::npos)
            break;
        start++;
        size_t end = content.find("\"", start);
        if (end == string::npos)
            break;

        string key = content.substr(start, end - start);
        if (key == "n" || key == "k" || key == "keys")
        {
            pos = end + 1;
            continue;
        }

        // Try to parse as number (point key)
        bool isNumber = true;
        for (char c : key)
        {
            if (!isdigit(c))
            {
                isNumber = false;
                break;
            }
        }

        if (isNumber)
        {
            int x = stoi(key);

            // Find base
            size_t baseStart = content.find("\"base\":", end);
            if (baseStart == string::npos)
                break;
            baseStart = content.find("\"", baseStart + 7) + 1;
            size_t baseEnd = content.find("\"", baseStart);
            int base = stoi(content.substr(baseStart, baseEnd - baseStart));

            // Find value
            size_t valueStart = content.find("\"value\":", baseEnd);
            if (valueStart == string::npos)
                break;
            valueStart = content.find("\"", valueStart + 8) + 1;
            size_t valueEnd = content.find("\"", valueStart);
            string value = content.substr(valueStart, valueEnd - valueStart);

            tc.points.push_back({x, {base, value}});
            pos = valueEnd + 1;
        }
        else
        {
            pos = end + 1;
        }
    }

    return tc;
}

// lagrange interpolation at x=0 → gives constant C
long double lagrangeF0(const vector<pair<long double, long double>> &pts)
{
    int n = pts.size();
    long double total = 0.0;
    for (int i = 0; i < n; i++)
    {
        long double num = 1.0, den = 1.0;
        for (int j = 0; j < n; j++)
        {
            if (i == j)
                continue;
            num *= (-pts[j].first);
            den *= (pts[i].first - pts[j].first);
        }
        total += pts[i].second * (num / den);
    }
    return total;
}

int main()
{
    // --- Test Case 1 ---
    cout << "Processing Test Case 1..." << endl;
    TestCase tc1 = parseJSON("test_case_1.json");

    vector<pair<long double, long double>> case1;
    // Sort points by x coordinate and take first k points
    sort(tc1.points.begin(), tc1.points.end());

    for (int i = 0; i < min(tc1.k, (int)tc1.points.size()); i++)
    {
        int x = tc1.points[i].first;
        int base = tc1.points[i].second.first;
        string value = tc1.points[i].second.second;
        long long decoded = decodeBase(value, base);
        case1.push_back({(long double)x, (long double)decoded});
        cout << "Point " << x << ": base " << base << " value '" << value << "' -> " << decoded << endl;
    }

    long long result1 = llround(lagrangeF0(case1));
    cout << "Test Case 1 Result: " << result1 << endl
         << endl;

    // --- Test Case 2 ---
    cout << "Processing Test Case 2..." << endl;
    TestCase tc2 = parseJSON("test_case_2.json");

    vector<pair<long double, long double>> case2;
    // Sort points by x coordinate and take first k points
    sort(tc2.points.begin(), tc2.points.end());

    for (int i = 0; i < min(tc2.k, (int)tc2.points.size()); i++)
    {
        int x = tc2.points[i].first;
        int base = tc2.points[i].second.first;
        string value = tc2.points[i].second.second;
        long long decoded = decodeBase(value, base);
        case2.push_back({(long double)x, (long double)decoded});
        cout << "Point " << x << ": base " << base << " value '" << value << "' -> " << decoded << endl;
    }

    long double result2 = lagrangeF0(case2);
    cout << "Test Case 2 Result: " << fixed << setprecision(0) << result2 << endl;

    return 0;
}
