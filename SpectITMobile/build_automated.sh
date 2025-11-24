#!/usr/bin/expect -f

set timeout 600
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

spawn eas build --platform ios --profile production

expect {
    "Do you want to log in to your Apple account?" {
        send "yes\r"
        expect {
            -re "Apple ID.*:" {
                send "tanstrauss@gmail.com\r"
                expect {
                    -re "Password.*:" {
                        send "Kiara1403!\r"
                        expect {
                            "Would you like to try again?" {
                                send "yes\r"
                                exp_continue
                            }
                            "2FA" {
                                send_user "\n2FA code required - please enter manually\n"
                                interact
                            }
                            "Building" {
                                send_user "\n✅ Build started successfully!\n"
                            }
                            "Queued" {
                                send_user "\n✅ Build queued successfully!\n"
                            }
                            timeout {
                                send_user "\n⏳ Build process continuing...\n"
                            }
                        }
                    }
                    timeout {
                        send_user "\n⏳ Waiting for password prompt...\n"
                    }
                }
            }
            timeout {
                send_user "\n⏳ Waiting for Apple ID prompt...\n"
            }
        }
    }
    "Building" {
        send_user "\n✅ Build started successfully!\n"
    }
    "Queued" {
        send_user "\n✅ Build queued successfully!\n"
    }
    timeout {
        send_user "\n⏳ Build process continuing...\n"
    }
}

# Keep waiting for build to complete or error
expect {
    "Error" {
        send_user "\n❌ Build error occurred\n"
        exit 1
    }
    "finished" {
        send_user "\n✅ Build finished!\n"
    }
    "failed" {
        send_user "\n❌ Build failed\n"
        exit 1
    }
    timeout {
        send_user "\n⏳ Build still in progress...\n"
    }
    eof {
        send_user "\n✅ Build process completed\n"
    }
}

wait

