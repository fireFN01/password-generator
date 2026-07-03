import { useState, useEffect } from "react";
import { FaCopy, FaCheck, FaShieldAlt, FaSync } from "react-icons/fa";

const CHARSETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  similar: "Il1O0",
};

function getRandomChar(str: string): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return str[array[0] % str.length];
}

function generatePassword(
  length: number,
  options: { [key: string]: boolean },
  excludeSimilar: boolean
) {
  let charset = "";
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.numbers) charset += CHARSETS.numbers;
  if (options.symbols) charset += CHARSETS.symbols;
  if (excludeSimilar) {
    for (const c of CHARSETS.similar) {
      charset = charset.replace(new RegExp(c, "g"), "");
    }
  }
  if (!charset) return "";

  let password = "";
  for (let i = 0; i < length; i++) {
    password += getRandomChar(charset);
  }
  return password;
}

function calculateEntropy(password: string, charsetSize: number) {
  if (!password || charsetSize === 0) return 0;
  return Math.log2(charsetSize) * password.length;
}

function getStrength(entropy: number) {
  if (entropy < 28) return { label: "Debole", color: "bg-red-500", width: "w-1/4" };
  if (entropy < 36) return { label: "Media", color: "bg-yellow-500", width: "w-1/2" };
  if (entropy < 60) return { label: "Forte", color: "bg-lime-500", width: "w-3/4" };
  return { label: "Molto Forte", color: "bg-emerald-500", width: "w-full" };
}

export default function App() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  });
  const [excludeSimilar, setExcludeSimilar] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setPassword(generatePassword(length, options, excludeSimilar));
    setCopied(false);
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const charsetSize =
    (options.lowercase ? 26 : 0) +
    (options.uppercase ? 26 : 0) +
    (options.numbers ? 10 : 0) +
    (options.symbols ? 28 : 0) -
    (excludeSimilar ? 5 : 0);

  const entropy = calculateEntropy(password, charsetSize);
  const strength = getStrength(entropy);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Toggle = ({ label, checked, onChange }: any) => (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-zinc-300">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-11 h-6 appearance-none bg-zinc-700 rounded-full relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all checked:bg-emerald-500 checked:after:translate-x-5"
      />
    </label>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-emerald-400 text-2xl" />
          <h1 className="text-xl font-bold">SecurePass Generator</h1>
        </div>

        <div className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between gap-2">
          <input
            type="text"
            readOnly
            value={password}
            className="bg-transparent w-full outline-none font-mono text-lg truncate"
          />
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
          >
            {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy />}
          </button>
        </div>

        <div>
          <div className="flex justify-between text-sm text-zinc-400 mb-1">
            <span>Lunghezza: {length}</span>
            <span>Entropy: {entropy.toFixed(1)} bit</span>
          </div>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="space-y-3">
          <Toggle
            label="Minuscole a-z"
            checked={options.lowercase}
            onChange={() => setOptions({ ...options, lowercase: !options.lowercase })}
          />
          <Toggle
            label="Maiuscole A-Z"
            checked={options.uppercase}
            onChange={() => setOptions({ ...options, uppercase: !options.uppercase })}
          />
          <Toggle
            label="Numeri 0-9"
            checked={options.numbers}
            onChange={() => setOptions({ ...options, numbers: !options.numbers })}
          />
          <Toggle
            label="Simboli !@#$"
            checked={options.symbols}
            onChange={() => setOptions({ ...options, symbols: !options.symbols })}
          />
          <Toggle
            label="Escludi simili I,l,1,O,0"
            checked={excludeSimilar}
            onChange={() => setExcludeSimilar(!excludeSimilar)}
          />
        </div>

        <div>
          <div className="text-sm text-zinc-400 mb-1">Forza: {strength.label}</div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full ${strength.color} ${strength.width} transition-all`}></div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 transition font-semibold py-3 rounded-xl"
        >
          <FaSync /> Genera Nuova Password
        </button>
      </div>
    </div>
  );
    }
