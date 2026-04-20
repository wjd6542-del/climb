import { onMounted, ref } from "vue";

interface PostcodeResult {
  address: string;
  sido: string;
  zonecode: string;
  [key: string]: unknown;
}

interface GeocodeCoords {
  lat: number;
  lon: number;
}

interface OpenOptions {
  onAddress: (result: PostcodeResult, coords: GeocodeCoords | null) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export function useKakaoPostcode() {
  const geocoder = ref<any>(null);

  onMounted(() => {
    if (!window.kakao?.maps) return;
    window.kakao.maps.load(() => {
      geocoder.value = new window.kakao.maps.services.Geocoder();
    });
  });

  function open(options: OpenOptions) {
    new window.kakao.Postcode({
      oncomplete: (data: PostcodeResult) => {
        if (!geocoder.value) {
          options.onAddress(data, null);
          return;
        }

        geocoder.value.addressSearch(
          data.address,
          (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              options.onAddress(data, {
                lat: parseFloat(result[0].y),
                lon: parseFloat(result[0].x),
              });
            } else {
              options.onAddress(data, null);
            }
          },
        );
      },
    }).open();
  }

  return { open, geocoder };
}
