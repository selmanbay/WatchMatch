package com.matchflix.backend.reco;
import com.matchflix.backend.ml.MochinefClient;
import com.matchflix.backend.dto.MovieDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reco")
@CrossOrigin(origins = "http://localhost:3000")
public class RecoController {

    private final RecoService svc;

    public RecoController(RecoService svc) {
        this.svc = svc;
    }
    @GetMapping("/search")
    public List<MochinefClient.MovieSearchResult> search(@RequestParam String q) {
        return svc.searchByTitle(q);
    }


    @GetMapping("/personal")
    public List<MovieDto> personal(@RequestParam Long userId,
                                   @RequestParam(defaultValue = "20") int limit) {
        return svc.personal(userId, limit);
    }

    @GetMapping("/match")
    public List<MovieDto> match(@RequestParam Long userA,
                                @RequestParam Long userB,
                                @RequestParam(defaultValue = "30") int limit) {
        return svc.match(userA, userB, limit);
    }
}
