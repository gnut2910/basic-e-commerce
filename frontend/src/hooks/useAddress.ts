// File này dùng để quản lý địa chỉ tỉnh/thành, quận/huyện, phường/xã ở Việt Nam
import { useState, useEffect } from "react";

export interface Province {
  code: string;
  name: string;
}
export interface District {
  code: string;
  name: string;
}
export interface Ward {
  code: string;
  name: string;
}

export const useAddress = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince);
      setSelectedDistrict("");
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  const fetchProvinces = async () => {
    const res = await fetch("https://provinces.open-api.vn/api/p/");
    const data = await res.json();
    setProvinces(data);
    return data;
  };

  const fetchDistricts = async (provinceCode: string) => {
    const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
    return data.districts || [];
  };

  const fetchWards = async (districtCode: string) => {
    const res = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
    return data.wards || [];
  };

  return {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
  };
};
