package com.matchflix.backend.reco;

import com.matchflix.backend.dto.HomeFeedDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reco")
@CrossOrigin(origins = "http://localhost:3000")
public class HomeFeedController {

    private final HomeFeedService home;

    public HomeFeedController(HomeFeedService home) {
        this.home = home;
    }

    // HomeFeedController.java
    @GetMapping("/home")
    public HomeFeedDto home(@RequestParam(required = false) Long userId,
                            @RequestParam(defaultValue = "20") int perSection) {
        System.out.println("[reco/home] userId=" + userId + " perSection=" + perSection);
        return home.buildHome(userId, perSection);
    }

}
