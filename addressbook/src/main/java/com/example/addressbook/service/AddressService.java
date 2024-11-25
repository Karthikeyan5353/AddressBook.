package com.example.addressbook.service;

import com.example.addressbook.model.Address;
import com.example.addressbook.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {
    private final AddressRepository repository;

    public AddressService(AddressRepository repository) {
        this.repository = repository;
    }

    public List<Address> getAllAddresses() {
        return repository.findAll();
    }

    public Address saveAddress(Address address) {
        return repository.save(address);
    }

    public void deleteAddress(String id) {
        repository.deleteById(id);
    }
}
