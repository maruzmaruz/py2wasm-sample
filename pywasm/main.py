import sys
import json

def argv_sample():
    data = sys.argv[1]
    print('argv', data)

def stdin_sample():
    data = input()
    print('stdin', data)

def filein_sample():
    path = 'static/input.txt'
    with open(path, 'r') as f:
        data = f.read()
        print('filein', data)

def fileout_sample():
    data = [{'name':'hoge', 'value':'1'}, {'name':'piyo', 'value':'2'}]
    with open('static/output.json', '+w') as f:
        json.dump(data, f, ensure_ascii=False)

def main():
    argv_sample()

    stdin_sample()

    fileout_sample()

    filein_sample()

if __name__ == '__main__':
    main()