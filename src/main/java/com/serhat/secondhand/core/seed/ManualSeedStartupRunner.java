package com.serhat.secondhand.core.seed;

import com.serhat.secondhand.listing.application.electronics.ElectronicDataInitializer;
import com.serhat.secondhand.listing.application.vehicle.VehicleDataInitializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Tek seed kontrol noktası.
 *
 * <p>Varsayılan halde hiçbir seed çalışmaz.
 * Seed çalıştırmak için ilgili satırı uncomment et,
 * uygulamayı başlat, işten sonra tekrar comment'e al.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ManualSeedStartupRunner implements ApplicationRunner {

    private final VehicleDataInitializer vehicleDataInitializer;
    private final ElectronicDataInitializer electronicDataInitializer;

    @Override
    public void run(ApplicationArguments args) {
        // DİKKAT: Seed çalıştırmak için sadece ilgili satırı geçici olarak aç.
        // İş bitince tekrar comment'e al.

        //  vehicleDataInitializer.run();
        // electronicDataInitializer.run();
    }
}
