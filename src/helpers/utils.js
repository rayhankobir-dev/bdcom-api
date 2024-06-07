import _ from "lodash";
import os from "node:os";

export async function getUserData(user) {
  const data = _.pick(user, ["_id", "name", "roles"]);
  return data;
}

let prevCpuTimes = null;
export function getCpuUsage() {
  // Get CPU information
  const cpus = os.cpus();

  // Initialize variables to store total CPU time and idle CPU time
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  let cpuUsagePercentage = 0;
  if (prevCpuTimes) {
    const totalCPUTime = totalTick - prevCpuTimes.total;
    const idleCPUTime = totalIdle - prevCpuTimes.idle;
    cpuUsagePercentage = 100 - Math.floor((100 * idleCPUTime) / totalCPUTime);
  }

  prevCpuTimes = { total: totalTick, idle: totalIdle };
  return cpuUsagePercentage;
}

export function cpuAverage() {
  var totalIdle = 0,
    totalTick = 0;
  var cpus = os.cpus();

  for (var i = 0, len = cpus.length; i < len; i++) {
    var cpu = cpus[i];
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }

    totalIdle += cpu.times.idle;
  }
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

const arrAvg = function (arr) {
  if (arr && arr.length >= 1) {
    const sumArr = arr.reduce((a, b) => a + b, 0);
    return sumArr / arr.length;
  }
};

export function getCPULoadAVG(avgTime = 1000, delay = 100) {
  return new Promise((resolve, reject) => {
    const n = ~~(avgTime / delay);
    if (n <= 1) {
      reject("Error: interval to small");
    }

    let i = 0;
    let samples = [];
    const avg1 = cpuAverage();

    let interval = setInterval(() => {
      console.debug("CPU Interval: ", i);

      if (i >= n) {
        clearInterval(interval);
        resolve(~~(arrAvg(samples) * 100));
      }

      const avg2 = cpuAverage();
      const totalDiff = avg2.total - avg1.total;
      const idleDiff = avg2.idle - avg1.idle;

      samples[i] = 1 - idleDiff / totalDiff;

      i++;
    }, delay);
  });
}

export function getRamUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const usage = Math.floor((usedMemory / totalMemory) * 100);

  return usage;
}
