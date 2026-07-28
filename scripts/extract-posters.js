import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const videoPath = path.join(rootDir, "public", "videos", "chronis-assembly.mp4");
const imagesDir = path.join(rootDir, "public", "images");

console.log("Checking for video asset at:", videoPath);

if (!fs.existsSync(videoPath)) {
  console.error("\n[Error] public/videos/chronis-assembly.mp4 is not found!");
  console.error("Please place the video file in public/videos/ and run this script again.\n");
  process.exit(1);
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const firstFramePath = path.join(imagesDir, "chronis-poster-first.jpg");
const lastFramePath = path.join(imagesDir, "chronis-poster-last.jpg");

try {
  console.log("Extracting first frame using ffmpeg...");
  execSync(`ffmpeg -y -i "${videoPath}" -vframes 1 "${firstFramePath}"`, { stdio: "inherit" });

  console.log("Extracting last frame using ffmpeg...");
  execSync(`ffmpeg -y -sseof -0.1 -i "${videoPath}" -vframes 1 "${lastFramePath}"`, {
    stdio: "inherit",
  });

  console.log("\n[Success] Posters extracted successfully:");
  console.log(`- First Frame: ${firstFramePath}`);
  console.log(`- Last Frame: ${lastFramePath}\n`);
} catch (error) {
  console.error(
    "\n[Error] Failed to run ffmpeg. Please make sure ffmpeg is installed and in your PATH.",
  );
  console.error(error.message, "\n");
  process.exit(1);
}
