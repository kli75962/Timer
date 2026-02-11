import "./App.css";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { exit } from "@tauri-apps/plugin-process";
import { useState, useEffect, useRef } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

function App() {
  //pin button
  const [isOnTop, setIsOnTop] = useState(false);

  useEffect(() => {
    getCurrentWindow().setAlwaysOnTop(isOnTop);
  }, [isOnTop]);

  useEffect(() => {
    //notification permission
    async function setPermission() {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }
    }
    setPermission();

    //shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        exit(0);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //timer
  const [userinput, setUserInput] = useState("");
  const [ph, setPH] = useState("");
  const [hour, setHour] = useState(0);
  const [min, setMin] = useState(0);
  const [sec, setSec] = useState(0);
  const [totalsec, setTotalsec] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [TimeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (userinput && !isRunning) {
      if (!userinput.includes("h")) setHour(0);
      if (!userinput.includes("m")) setMin(0);
      if (!userinput.includes("s")) setSec(0);

      if (userinput.includes("h")) {
        const match = userinput.match(/(\d+)h/);
        if (match) setHour(parseInt(match[1]));
      }
      if (userinput.includes("m")) {
        const match = userinput.match(/(\d+)m/);
        if (match) setMin(parseInt(match[1]));
      }
      if (userinput.includes("s")) {
        const match = userinput.match(/(\d+)s/);
        if (match) setSec(parseInt(match[1]));
      }
      if (userinput.includes("c") || userinput.includes("r")) {
        setUserInput("");
      }
    }
  }, [userinput]);

  useEffect(() => {
    setHour(Math.floor(totalsec / 3600));
    setMin(Math.floor((totalsec % 3600) / 60));
    setSec(Math.floor(totalsec % 60));

    let countDown: any = null;
    if (totalsec > 0) {
      setIsRunning(true);
      countDown = setInterval(() => {
        setTotalsec((prev) => prev - 1);
      }, 1000);
    } else if (totalsec === 0 && isRunning) {
      setPH("");
      setIsRunning(false);
      sendNotification({ title: "Timer", body: "TimesUP!" });
    }

    return () => {
      if (countDown) clearInterval(countDown);
    };
  }, [totalsec]);

  function setTimer() {
    setTotalsec(hour * 3600 + min * 60 + sec);
    setUserInput("");
    setPH("");
  }

  function setClock() {
    let totalsettime = hour * 3600 + min * 60 + sec;

    const now = new Date();
    const ch = now.getHours()*3600;
    const cm = now.getMinutes()*60;
    const cs = now.getSeconds();
    const TotalCurrentSec = ch + cm + cs;
    console.log(`total set time: ${totalsettime}`+`TotalCurrentSec: ${TotalCurrentSec}`);
    if(TotalCurrentSec>totalsettime){
      totalsettime+=totalsettime+(24*60*60);
    }
    setTimeLeft(totalsettime - TotalCurrentSec);
  }

  useEffect(() => {
    let countDown: any = null;
    if (TimeLeft > 0) {
      setIsRunning(true);
      countDown = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      console.log(`TimeLeft: ${TimeLeft}`);
    } else if (TimeLeft === 0 && isRunning) {
      setPH("");
      setIsRunning(false);
      setHour(0);
      setMin(0);
      setSec(0);
      sendNotification({ title: "Timer", body: "TimesUP!" });
    }
    return () => {
      if (countDown) clearInterval(countDown);
    };
  }, [TimeLeft]);

  //click to input
  const inputRef = useRef<HTMLInputElement>(null);
  function handleClick() {
    inputRef.current?.focus();
  }

  return (
    <main className="container" data-tauri-drag-region onClick={handleClick}>
      <button
        className="always-on-top-toggle"
        onClick={() => setIsOnTop(!isOnTop)}
        title="Toggle Always On Top"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.0004 15L12.0004 22M8.00043 7.30813V9.43875C8.00043 9.64677 8.00043 9.75078 7.98001 9.85026C7.9619 9.93852 7.93194 10.0239 7.89095 10.1042C7.84474 10.1946 7.77977 10.2758 7.64982 10.4383L6.08004 12.4005C5.4143 13.2327 5.08143 13.6487 5.08106 13.9989C5.08073 14.3035 5.21919 14.5916 5.4572 14.7815C5.73088 15 6.26373 15 7.32943 15H16.6714C17.7371 15 18.27 15 18.5437 14.7815C18.7817 14.5916 18.9201 14.3035 18.9198 13.9989C18.9194 13.6487 18.5866 13.2327 17.9208 12.4005L16.351 10.4383C16.2211 10.2758 16.1561 10.1946 16.1099 10.1042C16.0689 10.0239 16.039 9.93852 16.0208 9.85026C16.0004 9.75078 16.0004 9.64677 16.0004 9.43875V7.30813C16.0004 7.19301 16.0004 7.13544 16.0069 7.07868C16.0127 7.02825 16.0223 6.97833 16.0357 6.92937C16.0507 6.87424 16.0721 6.8208 16.1149 6.71391L17.1227 4.19423C17.4168 3.45914 17.5638 3.09159 17.5025 2.79655C17.4489 2.53853 17.2956 2.31211 17.0759 2.1665C16.8247 2 16.4289 2 15.6372 2H8.36368C7.57197 2 7.17611 2 6.92494 2.1665C6.70529 2.31211 6.55199 2.53853 6.49838 2.79655C6.43707 3.09159 6.58408 3.45914 6.87812 4.19423L7.88599 6.71391C7.92875 6.8208 7.95013 6.87424 7.96517 6.92937C7.97853 6.97833 7.98814 7.02825 7.99392 7.07868C8.00043 7.13544 8.00043 7.19301 8.00043 7.30813Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <div className="container12" data-tauri-drag-region>
        <h1 id="showHour" data-tauri-drag-region>
          {hour.toString().padStart(2, "0")}
        </h1>
        <h1 data-tauri-drag-region>:</h1>
        <h1 id="showMin" data-tauri-drag-region>
          {min.toString().padStart(2, "0")}
        </h1>
        <h1 data-tauri-drag-region>:</h1>
        <h1 id="showSec" data-tauri-drag-region>
          {sec.toString().padStart(2, "0")}
        </h1>
      </div>
      <input
        ref={inputRef}
        data-tauri-drag-region
        type="text"
        placeholder={ph}
        value={userinput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            setIsRunning(false);
            setTimer();
          }
          if (e.key === "c" || e.key === "C") {
            setIsRunning(false);
            setClock();
          }
          if (e.key === "R" || (e.key === "r" && isRunning)) {
            setPH("");
            setIsRunning(false);
            setTotalsec(0);
            setTimeLeft(0);
          }
        }}
      />
    </main>
  );
}

export default App;
