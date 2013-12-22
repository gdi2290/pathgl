      vec4 pack (float depth)
        {
            const vec4 bitSh = vec4(256 * 256 * 256,
                                    256 * 256,
                                    256,
                                    1.0);
            const vec4 bitMsk = vec4(0,
                                     1.0 / 256.0,
                                     1.0 / 256.0,
                                     1.0 / 256.0);
            vec4 comp = fract(depth * bitSh);
            comp -= comp.xxyz * bitMsk;
            return comp;
        }


float unpack (vec4 colour)
        {
            const vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),
                                        1.0 / (256.0 * 256.0),
                                        1.0 / 256.0,
                                        1);
            return dot(colour , bitShifts);
        }
