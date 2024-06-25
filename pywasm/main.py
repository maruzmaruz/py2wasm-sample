import sys
import json

def recursive(bin):
    if len(bin) > 4:
        print('%02X' % bin[0], '%02X' % bin[1], '%02X' % bin[2], '%02X' % bin[3])
        recursive(bin[4:])
    else:
        if len(bin) > 0:
            print('%02X' % bin[0])
            recursive(bin[1:])


def main():
    # if len(sys.argv) != 3:
    #     raise Exception("few arguments")
    print("hello")
    path = sys.argv[1]
    print(path)
    # a = input()
    # print(a)
    
    with open(path, 'rb') as f:
        bindata = f.read()
        recursive(bindata)

    data = [{'name':'hoge', 'value':'1'}, {'name':'piyo', 'value':'2'}]

    with open('/mount/newfile.json', '+w') as f:
        json.dump(data, f, ensure_ascii=False)
