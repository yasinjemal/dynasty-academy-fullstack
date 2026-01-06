// Test the course API response
fetch("http://localhost:3000/api/courses/course-1760650591599")
  .then((res) => res.json())
  .then((data) => {
    console.log("📦 Full API Response:");
    console.log(JSON.stringify(data, null, 2));
    console.log("\n📊 Key Fields:");
    console.log("- totalLessons:", data.totalLessons);
    console.log("- lessonCount:", data.lessonCount);
    console.log("- completedLessons:", data.completedLessons);
    console.log("- progress:", data.progress);
    console.log("- sections count:", data.sections?.length);

    if (data.sections) {
      let lessonCount = 0;
      data.sections.forEach((section) => {
        lessonCount += section.lessons?.length || 0;
      });
      console.log("- calculated lessons from sections:", lessonCount);
    }
  })
  .catch((err) => console.error("❌ Error:", err));
