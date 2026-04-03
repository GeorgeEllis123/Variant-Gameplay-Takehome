1. **What you built** and why  

In this minigame, you play as a crowd "surfer" trying to stay on beat while riding the crowd. To do this, the player presses in time with the crowd as they bop their heads. Properly timed inputs build up a streak, which lets the player perform tricks and stay afloat more easily, but it also causes more characters to stop head-bopping and just dance. This then forces the player to focus more carefully on the actual head-boppers.

If the player misses a beat or misclicks, they begin to drift off-screen; if they go completely off-screen, they lose. There’s currently no win condition; you simply keep going until you fail.

Building this game was an interesting challenge, especially working within the Spine constraints and the preset animation list. I spent a lot of time testing different animations and seeing what stood out. As I browsed through the various dancing animations, I started imagining scenes where they might fit and thinking about different rhythm game ideas. When I came across the "surfing" animation, it made me think of crowd surfing.

I tried an initial version where the player timed clicks based on the crowd’s head-bops, with a few dancers mixed in. I quickly realized those extra dancers could act as distractions, and that’s where the core mechanic of the game came from.

2. **One technical challenge** you hit with Phaser or Spine  

One technical challenge I struggled with was handling the graphics and UI. This was my first time using Phaser, so figuring out how everything fit together took some trial and error, along with a fair amount of research. Things like layering elements correctly, syncing visuals with gameplay, and managing positioning weren’t immediately intuitive. By the end, I was able to get a much better handle on it and build something that worked consistently. It also gave me a better understanding of how to structure scenes and UI elements, which I’d feel a lot more comfortable building on in the future.

3. **What you’d add** with another ~48 hours  

After finishing the demo, I playtested it with several friends to get their feedback. After a couple runs, players seemed to understand the controls and found the game fairly easy to pick up. They enjoyed the basic game loop, but would’ve liked to see more nuance and complexity over a longer play session.

With more time, I’d experiment with adding depth to the core mechanic and potentially ramping up the difficulty. Players were big fans of trying to spot the head-bobbing characters in the crowd, so it could be interesting to explore additional distraction mechanics around that idea.

I’d also want to improve the graphics and overall polish. For example, fixing the out-of-place fall animation when you lose your streak and adding background music. Finally, it would be interesting to dive deeper into the "surfing" playstyle and explore what elements from real-life surfing could be incorporated mechanically.