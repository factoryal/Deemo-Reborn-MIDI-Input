#include <iostream>
#include <WinSock2.h>
#include <Windows.h>

using namespace std;

#pragma warning(disable: 4996)
#pragma comment(lib, "Ws2_32.lib")

class Keyboard {
private:
	INPUT ip;
	const char keycode[6] = { 0x53, 0x44, 0x46, 0x4A, 0x4B, 0x4C };

public:
	Keyboard() {
		ip.type = INPUT_KEYBOARD;
		ip.ki.wScan = 0;
		ip.ki.time = 0;
		ip.ki.dwExtraInfo = 0;
	}

	void press(int kidx) {
		ip.ki.wVk = keycode[kidx];
		ip.ki.dwFlags = KEYEVENTF_UNICODE;
		SendInput(1, &ip, sizeof(INPUT));
	}

	void release(int kidx) {
		ip.ki.wVk = keycode[kidx];
		ip.ki.dwFlags = KEYEVENTF_KEYUP | KEYEVENTF_UNICODE;
		SendInput(1, &ip, sizeof(INPUT));
	}

} Keyboard;

int main(void) {
	SOCKET client;
	WSADATA wsaData;
	SOCKADDR_IN server_addr;

	WSAStartup(0x0202, &wsaData);
	client = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);

	server_addr.sin_family = AF_INET;
	server_addr.sin_port = htons(53123);
	server_addr.sin_addr.S_un.S_addr = inet_addr("127.0.0.1");

	if (connect(client, (SOCKADDR*)& server_addr, sizeof(server_addr))) {
		cout << "connect failed" << endl;
		exit(1);
	}

	char msg[50];
	int key = 0, type = 0;

	while (1) {
		int strLen = recv(client, msg, 50 - 1, 0);
		msg[strLen] = NULL;
		sscanf_s(msg, "%d %d", &key, &type);
		cout << key << " " << type << endl;
		if (type == 1) {
			Keyboard.press(key);
		}
		else {
			Keyboard.release(key);
		}

	}

	return 0;
}